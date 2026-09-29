import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getCurrentUser, privacySafeUserIdentifier } from "@/lib/auth";
import { toPublicAiError } from "@/lib/ai-error";
import { buildTutorInstructions } from "@/lib/ai-prompt";
import { getDb } from "@/lib/db";
import { getChatModel, getOpenAIClient } from "@/lib/openai";
import { getLanguage } from "@/lib/language-server";
import { getCourseForUser } from "@/lib/queries";
import { buildKnowledgeContext, retrieveSources } from "@/lib/rag";
import { truncate } from "@/lib/utils";
import type { RetrievedSource } from "@/lib/rag";

const schema = z.object({
  conversationId: z.string().min(1).optional().nullable(),
  courseId: z.string().min(1),
  message: z.string().trim().min(1).max(12_000),
  learningMode: z.enum(["explain", "socratic", "debug", "exam", "paper", "quiz"]).default("explain"),
  selectedMaterialIds: z.array(z.string()).max(30).default([]),
});

type HistoryRow = { role: "user" | "assistant"; content: string };

function titleFromMessage(message: string, language: "en" | "zh"): string {
  return truncate(message.replace(/```[\s\S]*?```/g, language === "zh" ? "代码问题" : "Code question").replace(/\s+/g, " "), 48);
}

function toPublicSource(source: RetrievedSource) {
  return {
    sourceIndex: source.sourceIndex,
    chunkId: source.chunkId,
    materialId: source.materialId,
    materialTitle: source.materialTitle,
    courseCode: source.courseCode,
    pageNumber: source.pageNumber,
    snippet: source.snippet,
    score: source.score,
  };
}

export async function POST(request: Request) {
  const language = await getLanguage();
  const copy = language === "zh" ? {
    login: "请先登录。", invalid: "对话参数无效。", forbidden: "你没有访问这门课程的权限。", notConfigured: "尚未配置 OPENAI_API_KEY。请在 .env.local 中添加密钥后重启开发服务。", limit: "今天的 AI 提问次数已达到上限，请明天再试。", missing: "对话不存在。",
  } : {
    login: "Please log in first.", invalid: "The conversation request is invalid.", forbidden: "You do not have access to this course.", notConfigured: "OPENAI_API_KEY is not configured. Add it to .env.local and restart the development server.", limit: "You have reached today's AI message limit. Please try again tomorrow.", missing: "Conversation not found.",
  };
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: copy.login }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: copy.invalid }, { status: 400 });
  const input = parsed.data;
  const course = getCourseForUser(user, input.courseId);
  if (!course) return NextResponse.json({ error: copy.forbidden }, { status: 403 });

  const openai = getOpenAIClient();
  if (!openai) {
    return NextResponse.json(
      { error: copy.notConfigured, code: "AI_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const db = getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daily = db
    .prepare(
      `SELECT COUNT(*) AS count FROM messages m
       JOIN conversations c ON c.id = m.conversation_id
       WHERE c.user_id = ? AND m.role = 'user' AND m.created_at >= ?`,
    )
    .get(user.id, today.toISOString()) as { count: number };
  if (daily.count >= Number(process.env.AI_DAILY_MESSAGE_LIMIT || 100)) {
    return NextResponse.json({ error: copy.limit }, { status: 429 });
  }

  const conversationId = input.conversationId || randomUUID();
  let title = titleFromMessage(input.message, language);
  if (input.conversationId) {
    const existing = db
      .prepare("SELECT id, title FROM conversations WHERE id = ? AND user_id = ?")
      .get(input.conversationId, user.id) as { id: string; title: string } | undefined;
    if (!existing) return NextResponse.json({ error: copy.missing }, { status: 404 });
    title = existing.title;
    db.prepare("UPDATE conversations SET course_id = ?, learning_mode = ?, updated_at = ? WHERE id = ?")
      .run(course.id, input.learningMode, new Date().toISOString(), conversationId);
  } else {
    db.prepare(
      "INSERT INTO conversations (id, user_id, course_id, title, learning_mode, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ).run(conversationId, user.id, course.id, title, input.learningMode, new Date().toISOString(), new Date().toISOString());
  }

  db.prepare("INSERT INTO messages (id, conversation_id, role, content, created_at) VALUES (?, ?, 'user', ?, ?)")
    .run(randomUUID(), conversationId, input.message, new Date().toISOString());

  const history = db
    .prepare(
      `SELECT role, content FROM messages
       WHERE conversation_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 14`,
    )
    .all(conversationId) as HistoryRow[];
  history.reverse();

  const sources = await retrieveSources({
    userId: user.id,
    courseId: course.id,
    query: input.message,
    selectedMaterialIds: input.selectedMaterialIds,
    limit: 6,
  });
  const instructions = buildTutorInstructions({
    courseCode: course.code,
    courseName: course.name,
    learningMode: input.learningMode,
    knowledgeContext: buildKnowledgeContext(sources),
  });
  const model = getChatModel();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (payload: unknown) => controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
      send({ type: "meta", conversationId, title, sources: sources.map(toPublicSource) });

      let answer = "";
      let inputTokens = 0;
      let outputTokens = 0;
      try {
        const responseStream = await openai.responses.create({
          model,
          instructions,
          input: history.map((message) => ({ role: message.role, content: message.content })),
          reasoning: { effort: "low" },
          text: { verbosity: "medium" },
          safety_identifier: privacySafeUserIdentifier(user.id),
          stream: true,
        });

        for await (const event of responseStream) {
          if (event.type === "response.output_text.delta") {
            answer += event.delta;
            send({ type: "delta", text: event.delta });
          }
          if (event.type === "response.completed") {
            inputTokens = event.response.usage?.input_tokens || 0;
            outputTokens = event.response.usage?.output_tokens || 0;
          }
        }

        const assistantId = randomUUID();
        const citedIndexes = new Set(
          [...answer.matchAll(/\[S(\d+)\]/g)].map((match) => Number(match[1])).filter(Number.isFinite),
        );
        const citedSources = sources.filter((source) => citedIndexes.has(source.sourceIndex));
        const now = new Date().toISOString();
        const save = db.transaction(() => {
          db.prepare(
            `INSERT INTO messages
              (id, conversation_id, role, content, model, input_tokens, output_tokens, created_at)
             VALUES (?, ?, 'assistant', ?, ?, ?, ?, ?)`,
          ).run(assistantId, conversationId, answer, model, inputTokens, outputTokens, now);
          const insertCitation = db.prepare(
            `INSERT INTO message_citations
              (id, message_id, chunk_id, material_id, label, snippet, page_number, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          );
          for (const source of citedSources) {
            insertCitation.run(randomUUID(), assistantId, source.chunkId, source.materialId, `S${source.sourceIndex}`, source.snippet, source.pageNumber, now);
          }
          db.prepare("UPDATE conversations SET updated_at = ? WHERE id = ?").run(now, conversationId);
          db.prepare(
            `INSERT INTO usage_records
              (id, user_id, conversation_id, model, input_tokens, output_tokens, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ).run(randomUUID(), user.id, conversationId, model, inputTokens, outputTokens, now);
        });
        save();
        send({ type: "done", messageId: assistantId, citations: citedSources.map(toPublicSource), usage: { inputTokens, outputTokens } });
      } catch (error) {
        console.error("AI response failed", error);
        const publicError = toPublicAiError(error, language);
        send({ type: "error", error: publicError.message, code: publicError.code });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
