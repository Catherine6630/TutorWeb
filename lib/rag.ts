import { getDb } from "@/lib/db";
import { createEmbedding } from "@/lib/openai";
import { cosineSimilarity, lexicalScore } from "@/lib/text";
import { truncate } from "@/lib/utils";
import type { Citation } from "@/lib/models";

type ChunkRow = {
  id: string;
  material_id: string;
  content: string;
  page_number: number | null;
  embedding: string | null;
  material_title: string;
  course_code: string;
};

export type RetrievedSource = Citation & { content: string };

function parseEmbedding(value: string | null): number[] | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "number") ? parsed : null;
  } catch {
    return null;
  }
}

export async function retrieveSources(options: {
  userId: string;
  courseId: string;
  query: string;
  selectedMaterialIds?: string[];
  limit?: number;
}): Promise<RetrievedSource[]> {
  const { userId, courseId, query, selectedMaterialIds = [], limit = 5 } = options;
  const db = getDb();
  const selectedSql = selectedMaterialIds.length
    ? ` AND m.id IN (${selectedMaterialIds.map(() => "?").join(",")})`
    : "";
  const rows = db
    .prepare(
      `SELECT c.id, c.material_id, c.content, c.page_number, c.embedding,
              m.title AS material_title, courses.code AS course_code
       FROM material_chunks c
       JOIN materials m ON m.id = c.material_id
       JOIN courses ON courses.id = m.course_id
       WHERE m.course_id = ?
         AND m.processing_status = 'ready'
         AND (m.visibility = 'course' OR m.owner_id = ?)
         ${selectedSql}
       LIMIT 500`,
    )
    .all(courseId, userId, ...selectedMaterialIds) as ChunkRow[];

  const queryEmbedding = await createEmbedding(query);
  const scored = rows.map((row) => {
    const lexical = lexicalScore(query, row.content);
    const stored = parseEmbedding(row.embedding);
    const semantic = queryEmbedding && stored ? Math.max(0, cosineSimilarity(queryEmbedding, stored)) : 0;
    const score = queryEmbedding && stored ? semantic * 0.72 + lexical * 0.28 : lexical;
    return { row, score };
  });

  const best = scored
    .filter((item) => item.score > 0 || rows.length <= limit)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (!best.length && rows.length) {
    best.push(...rows.slice(0, limit).map((row) => ({ row, score: 0 })));
  }

  return best.map(({ row, score }, index) => ({
    sourceIndex: index + 1,
    chunkId: row.id,
    materialId: row.material_id,
    materialTitle: row.material_title,
    courseCode: row.course_code,
    pageNumber: row.page_number,
    snippet: truncate(row.content.replace(/\s+/g, " "), 280),
    content: row.content,
    score,
  }));
}

export function buildKnowledgeContext(sources: RetrievedSource[]): string {
  if (!sources.length) return "No course source was retrieved for this question.";
  return sources
    .map(
      (source) =>
        `<source id="S${source.sourceIndex}" course="${source.courseCode}" title="${source.materialTitle}" page="${source.pageNumber ?? "unknown"}">\n${source.content}\n</source>`,
    )
    .join("\n\n");
}
