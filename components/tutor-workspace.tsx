"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bookmark,
  Check,
  ChevronDown,
  Copy,
  FileText,
  LoaderCircle,
  Menu,
  MessageSquarePlus,
  MoreHorizontal,
  PanelRightClose,
  PanelRightOpen,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { useLanguage } from "@/components/language-provider";
import { getLearningModes } from "@/lib/constants";
import { localeFor } from "@/lib/language";
import { cn } from "@/lib/utils";
import type { ChatMessage, Citation, ConversationSummary, Course, Material } from "@/lib/models";

type StreamEvent =
  | { type: "meta"; conversationId: string; title: string; sources: Citation[] }
  | { type: "delta"; text: string }
  | { type: "done"; messageId: string; citations: Citation[] }
  | { type: "error"; error: string; code?: string };

export function TutorWorkspace({
  courses,
  materials,
  initialConversations,
  initialConversation,
  initialCourseId,
  aiConfigured,
}: {
  courses: Course[];
  materials: Material[];
  initialConversations: ConversationSummary[];
  initialConversation: { id: string; title: string; courseId: string | null; learningMode: string; messages: ChatMessage[] } | null;
  initialCourseId?: string;
  aiConfigured: boolean;
}) {
  const router = useRouter();
  const { language } = useLanguage();
  const learningModes = getLearningModes(language);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const tempIdRef = useRef(0);
  const [conversations, setConversations] = useState(initialConversations);
  const [conversationId, setConversationId] = useState<string | null>(initialConversation?.id || null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialConversation?.messages || []);
  const [courseId, setCourseId] = useState(initialConversation?.courseId || initialCourseId || courses[0]?.id || "");
  const [mode, setMode] = useState(initialConversation?.learningMode || "explain");
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sources, setSources] = useState<Citation[]>(initialConversation?.messages.flatMap((message) => message.citations) || []);
  const [activeSource, setActiveSource] = useState<Citation | null>(null);
  const [rightOpen, setRightOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [materialOpen, setMaterialOpen] = useState(false);
  const copy = language === "zh" ? {
    deleteConfirm: "确定删除这条对话吗？", sendFailed: "无法发送消息。", notSaved: "对话没有成功保存。", aiFailed: "AI 暂时无法回答。",
    history: "对话记录", conversationCount: "条对话", newConversation: "新建对话", deleteConversation: "删除对话", emptyHistory: "你的对话会保存在这里。", closeHistory: "关闭对话记录",
    sourcePanel: "切换来源面板", notConfigured: "AI 尚未配置。在 .env.local 中设置 OPENAI_API_KEY 后即可真实对话；资料库和演示页面仍可使用。",
    start: (code?: string) => `从 ${code ?? "课程"} 开始学习`, intro: "我会优先使用这门课的资料，并在回答中标记来源。你也可以指定某一份课件或 Past Paper。",
    copyAnswer: "复制回答", bookmarkAnswer: "收藏回答", input: "输入问题，或粘贴一段代码…", selected: (count: number) => `已选 ${count} 份资料`, allMaterials: "全部课程资料", scope: "限定检索范围",
    disclaimer: "AI 可能出错，请根据引用资料核对重要内容。Enter 发送，Shift + Enter 换行。", sources: "资料来源", page: (page: number) => `第 ${page} 页`, emptySources: "提问后，相关资料会显示在这里。",
    suggestions: [
      { title: "解释一个概念", prompt: "请根据课程资料，解释这门课最核心的概念，并给一个直观例子。" },
      { title: "生成复习 Quiz", prompt: "请根据课程资料出一道难度适中的复习题，一次只出一题，等我回答。" },
      { title: "分析 Past Paper", prompt: "请总结资料库中 Past Paper 的常见考点，并给出复习优先级。" },
      { title: "梳理易错点", prompt: "这门课有哪些学生容易混淆的知识点？请用对比方式讲解。" },
    ],
  } : {
    deleteConfirm: "Delete this conversation?", sendFailed: "Unable to send the message.", notSaved: "The conversation was not saved.", aiFailed: "AI is temporarily unable to answer.",
    history: "Conversation history", conversationCount: "conversations", newConversation: "New conversation", deleteConversation: "Delete conversation", emptyHistory: "Your conversations will appear here.", closeHistory: "Close conversation history",
    sourcePanel: "Toggle sources panel", notConfigured: "AI is not configured. Set OPENAI_API_KEY in .env.local and restart the server; the library and demo pages remain available.",
    start: (code?: string) => `Start learning ${code ?? "this course"}`, intro: "I will prioritise this course's materials and cite them in each answer. You can also select a specific lecture or past paper.",
    copyAnswer: "Copy answer", bookmarkAnswer: "Bookmark answer", input: "Ask a question or paste some code…", selected: (count: number) => `${count} materials selected`, allMaterials: "All course materials", scope: "Limit retrieval scope",
    disclaimer: "AI can make mistakes. Verify important details against the cited sources. Enter to send; Shift + Enter for a new line.", sources: "Sources", page: (page: number) => `Page ${page}`, emptySources: "Relevant course sources will appear here after you ask a question.",
    suggestions: [
      { title: "Explain a concept", prompt: "Using the course materials, explain the most important concept in this course and give one intuitive example." },
      { title: "Generate a revision quiz", prompt: "Create one medium-difficulty revision question from the course materials. Wait for my answer before continuing." },
      { title: "Analyse past papers", prompt: "Summarise common topics in the past papers and recommend a revision priority." },
      { title: "Compare common pitfalls", prompt: "Which ideas in this course do students often confuse? Explain them by comparison." },
    ],
  };

  const course = courses.find((item) => item.id === courseId);
  const availableMaterials = materials.filter((material) => material.courseId === courseId && material.processingStatus === "ready");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function newConversation() {
    setConversationId(null);
    setMessages([]);
    setSources([]);
    setActiveSource(null);
    setError("");
    router.replace(`/tutor?course=${courseId}`);
  }

  async function loadConversation(id: string) {
    if (sending) return;
    const response = await fetch(`/api/conversations/${id}`);
    if (!response.ok) return;
    const data = (await response.json()) as { conversation: { id: string; courseId: string | null; learningMode: string; messages: ChatMessage[] } };
    setConversationId(data.conversation.id);
    setCourseId(data.conversation.courseId || courses[0]?.id || "");
    setMode(data.conversation.learningMode);
    setMessages(data.conversation.messages);
    const nextSources = data.conversation.messages.flatMap((message) => message.citations);
    setSources(nextSources);
    setActiveSource(nextSources[0] || null);
    setHistoryOpen(false);
    router.replace(`/tutor?conversation=${id}`);
  }

  async function deleteConversation(id: string) {
    if (!window.confirm(copy.deleteConfirm)) return;
    const response = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
    if (!response.ok) return;
    setConversations((current) => current.filter((item) => item.id !== id));
    if (conversationId === id) newConversation();
  }

  async function sendMessage(message = input) {
    const trimmed = message.trim();
    if (!trimmed || sending || !courseId) return;
    setError("");
    setSending(true);
    setInput("");
    tempIdRef.current += 1;
    const tempKey = tempIdRef.current;
    const userMessage: ChatMessage = { id: `temp-user-${tempKey}`, role: "user", content: trimmed, model: null, createdAt: new Date().toISOString(), citations: [] };
    const assistantTempId = `temp-assistant-${tempKey}`;
    setMessages((current) => [...current, userMessage, { id: assistantTempId, role: "assistant", content: "", model: null, createdAt: new Date().toISOString(), citations: [] }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, courseId, message: trimmed, learningMode: mode, selectedMaterialIds }),
      });
      if (!response.ok || !response.body) {
        const result = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(result.error || copy.sendFailed);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let newConversationId = conversationId;
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as StreamEvent;
          if (event.type === "meta") {
            newConversationId = event.conversationId;
            setConversationId(event.conversationId);
            setSources(event.sources);
            setActiveSource(event.sources[0] || null);
            setConversations((current) => {
              if (current.some((item) => item.id === event.conversationId)) return current;
              return [{ id: event.conversationId, title: event.title, courseId, courseCode: course?.code || null, learningMode: mode, updatedAt: new Date().toISOString() }, ...current];
            });
            router.replace(`/tutor?conversation=${event.conversationId}`);
          }
          if (event.type === "delta") {
            setMessages((current) => current.map((item) => item.id === assistantTempId ? { ...item, content: `${item.content}${event.text}` } : item));
          }
          if (event.type === "done") {
            setMessages((current) => current.map((item) => item.id === assistantTempId ? { ...item, id: event.messageId, citations: event.citations } : item));
            if (event.citations.length) setSources(event.citations);
          }
          if (event.type === "error") throw new Error(event.error);
        }
        if (done) break;
      }
      if (!newConversationId) throw new Error(copy.notSaved);
    } catch (caught) {
      const messageText = caught instanceof Error ? caught.message : copy.aiFailed;
      setError(messageText);
      setMessages((current) => current.filter((item) => item.id !== assistantTempId || item.content));
    } finally {
      setSending(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function toggleMaterial(id: string) {
    setSelectedMaterialIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <div className="-m-4 flex h-[calc(100vh-64px)] overflow-hidden rounded-none border border-[#e6e7ee] bg-white sm:-m-7 lg:-m-8 lg:h-screen xl:-m-10">
      <aside className={cn("absolute inset-y-0 left-0 z-30 w-[285px] border-r border-[#e8e9ef] bg-white shadow-xl transition-transform xl:static xl:block xl:translate-x-0 xl:shadow-none", historyOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-16 items-center justify-between border-b border-[#ececf2] px-4"><div><p className="text-sm font-bold">{copy.history}</p><p className="text-[10px] text-[#9299a8]">{conversations.length} {copy.conversationCount}</p></div><button className="grid size-9 place-items-center rounded-lg bg-[#625bf6] text-white" onClick={newConversation} aria-label={copy.newConversation}><MessageSquarePlus size={17} /></button></div>
        <div className="h-[calc(100%-64px)] overflow-y-auto p-2.5">
          {conversations.map((item) => (
            <div key={item.id} className={cn("group mb-1 flex items-center rounded-xl", conversationId === item.id ? "bg-[#efefff]" : "hover:bg-[#f7f7fa]")}>
              <button onClick={() => loadConversation(item.id)} className="min-w-0 flex-1 px-3 py-3 text-left"><p className={cn("truncate text-xs font-semibold", conversationId === item.id ? "text-[#5750dd]" : "text-[#495267]")}>{item.title}</p><p className="mt-1 text-[10px] text-[#969dac]">{item.courseCode || "General"} · {new Date(item.updatedAt).toLocaleDateString(localeFor(language))}</p></button>
              <button onClick={() => deleteConversation(item.id)} className="mr-2 grid size-7 shrink-0 place-items-center rounded-lg text-[#a0a6b4] opacity-0 hover:bg-white hover:text-[#c33d3d] group-hover:opacity-100" aria-label={copy.deleteConversation}><Trash2 size={13} /></button>
            </div>
          ))}
          {!conversations.length && <p className="px-4 py-10 text-center text-xs leading-5 text-[#999fad]">{copy.emptyHistory}</p>}
        </div>
      </aside>

      {historyOpen && <button className="absolute inset-0 z-20 bg-[#172036]/25 xl:hidden" onClick={() => setHistoryOpen(false)} aria-label={copy.closeHistory} />}

      <section className="flex min-w-0 flex-1 flex-col bg-[#fbfbfd]">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[#e8e9ef] bg-white px-3 sm:px-5">
          <button onClick={() => setHistoryOpen(true)} className="grid size-9 place-items-center rounded-lg text-[#6d768a] hover:bg-[#f1f2f6] xl:hidden"><Menu size={19} /></button>
          <span className="grid size-9 place-items-center rounded-xl bg-[#efefff] text-[#625bf6]"><Sparkles size={17} /></span>
          <div className="min-w-0"><p className="truncate text-sm font-bold">AI Tutor</p><p className="truncate text-[10px] text-[#9299a8]">{course?.code} · {course?.name}</p></div>
          <div className="ml-auto flex items-center gap-2">
            <select value={courseId} onChange={(event) => { setCourseId(event.target.value); setSelectedMaterialIds([]); newConversation(); }} className="h-9 max-w-[145px] rounded-lg border border-[#dfe1e9] bg-white px-2.5 text-xs font-semibold text-[#4e5870] outline-none sm:max-w-none">
              {courses.map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}
            </select>
            <button onClick={() => setRightOpen((value) => !value)} className="grid size-9 place-items-center rounded-lg border border-[#e1e3e9] text-[#727b90] hover:bg-[#f5f5fa]" aria-label={copy.sourcePanel}>{rightOpen ? <PanelRightClose size={17} /> : <PanelRightOpen size={17} />}</button>
          </div>
        </header>

        {!aiConfigured && <div className="border-b border-[#ffe0a8] bg-[#fff8e8] px-4 py-2.5 text-center text-xs font-medium text-[#8f651a]">{copy.notConfigured}</div>}

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-5 sm:px-6">
          <div className="mx-auto max-w-3xl">
            {!messages.length ? (
              <div className="flex min-h-[58vh] flex-col items-center justify-center py-8 text-center">
                <span className="grid size-14 place-items-center rounded-2xl bg-[#625bf6] text-white shadow-[0_14px_30px_rgba(98,91,246,.25)]"><Sparkles size={25} /></span>
                <h1 className="mt-5 text-2xl font-bold tracking-[-0.035em]">{copy.start(course?.code)}</h1>
                <p className="mt-2 max-w-lg text-sm leading-6 text-[#788195]">{copy.intro}</p>
                <div className="mt-7 grid w-full max-w-2xl gap-2 sm:grid-cols-2">
                  {copy.suggestions.map((item) => <button key={item.title} onClick={() => sendMessage(item.prompt)} disabled={sending} className="rounded-xl border border-[#e2e3eb] bg-white p-3.5 text-left shadow-sm hover:border-[#c9c6f7] hover:bg-[#fafaff]"><p className="text-sm font-bold text-[#3a435a]">{item.title}</p><p className="mt-1 text-xs leading-5 text-[#8a92a5]">{item.prompt}</p></button>)}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-4">
                {messages.map((message) => (
                  <article key={message.id} className={cn("flex gap-3", message.role === "user" && "justify-end")}>
                    {message.role === "assistant" && <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-[#625bf6] text-white"><Sparkles size={15} /></span>}
                    <div className={cn("min-w-0 max-w-[88%]", message.role === "user" ? "rounded-2xl rounded-br-md bg-[#625bf6] px-4 py-3 text-sm leading-6 text-white shadow-sm" : "flex-1") }>
                      {message.role === "assistant" ? (
                        <div className="group rounded-2xl rounded-tl-md border border-[#e6e7ee] bg-white p-4 shadow-sm sm:p-5">
                          {message.content ? <div className="prose-tutor"><ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown></div> : <div className="flex items-center gap-1.5 py-2"><span className="thinking-dot size-1.5 rounded-full bg-[#625bf6]" /><span className="thinking-dot size-1.5 rounded-full bg-[#625bf6]" /><span className="thinking-dot size-1.5 rounded-full bg-[#625bf6]" /></div>}
                          {message.citations.length > 0 && <div className="mt-4 flex flex-wrap gap-2 border-t border-[#ececf2] pt-3">{message.citations.map((citation) => <button key={`${message.id}-${citation.sourceIndex}`} onClick={() => { setActiveSource(citation); setRightOpen(true); }} className="inline-flex items-center gap-1.5 rounded-lg bg-[#f0efff] px-2.5 py-1.5 text-[11px] font-bold text-[#5b54da]"><FileText size={12} /> S{citation.sourceIndex} · {citation.materialTitle}</button>)}</div>}
                          {message.content && <div className="mt-3 flex gap-1 opacity-0 transition group-hover:opacity-100"><button onClick={() => navigator.clipboard.writeText(message.content)} className="grid size-7 place-items-center rounded-lg text-[#9299a8] hover:bg-[#f1f2f6]" aria-label={copy.copyAnswer}><Copy size={13} /></button>{!message.id.startsWith("temp-") && <button onClick={() => fetch("/api/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messageId: message.id }) })} className="grid size-7 place-items-center rounded-lg text-[#9299a8] hover:bg-[#f1f2f6]" aria-label={copy.bookmarkAnswer}><Bookmark size={13} /></button>}</div>}
                        </div>
                      ) : message.content}
                    </div>
                  </article>
                ))}
                {error && <div className="rounded-xl border border-[#ffd4d4] bg-[#fff4f4] px-4 py-3 text-sm text-[#b43d3d]">{error}</div>}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-[#e8e9ef] bg-white px-3 py-3 sm:px-5">
          <div className="mx-auto max-w-3xl">
            <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
              {learningModes.map((item) => <button key={item.id} onClick={() => setMode(item.id)} className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold", mode === item.id ? "bg-[#efefff] text-[#5952dc]" : "bg-[#f5f6f8] text-[#737c90] hover:bg-[#efeff3]")}><item.icon size={12} />{item.shortLabel}</button>)}
            </div>
            <div className="relative rounded-2xl border border-[#dfe1ea] bg-white p-2 shadow-[0_8px_30px_rgba(23,32,54,.08)] focus-within:border-[#aaa6f5] focus-within:ring-4 focus-within:ring-[#625bf6]/8">
              <textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} rows={2} placeholder={copy.input} className="max-h-36 min-h-[52px] w-full resize-none bg-transparent px-2.5 py-2 text-sm leading-6 text-[#303950] outline-none placeholder:text-[#9ca3b1]" />
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="relative">
                  <button onClick={() => setMaterialOpen((value) => !value)} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold text-[#697287] hover:bg-[#f2f3f6]"><FileText size={13} /> {selectedMaterialIds.length ? copy.selected(selectedMaterialIds.length) : copy.allMaterials}<ChevronDown size={12} /></button>
                  {materialOpen && <div className="absolute bottom-10 left-0 z-20 max-h-64 w-72 overflow-y-auto rounded-xl border border-[#e1e2ea] bg-white p-2 shadow-xl"><div className="mb-1 flex items-center justify-between px-2 py-1"><p className="text-[11px] font-bold text-[#555e73]">{copy.scope}</p><button onClick={() => setMaterialOpen(false)}><X size={13} /></button></div>{availableMaterials.map((material) => <button key={material.id} onClick={() => toggleMaterial(material.id)} className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left hover:bg-[#f7f7fb]"><span className={cn("mt-0.5 grid size-4 shrink-0 place-items-center rounded border", selectedMaterialIds.includes(material.id) ? "border-[#625bf6] bg-[#625bf6] text-white" : "border-[#ccd0da]")}>{selectedMaterialIds.includes(material.id) && <Check size={11} />}</span><span><span className="block text-xs font-semibold text-[#444d64]">{material.title}</span><span className="block text-[10px] text-[#9198a8]">{material.materialType}</span></span></button>)}</div>}
                </div>
                <Button size="icon" onClick={() => sendMessage()} disabled={!input.trim() || sending || !aiConfigured} className="size-9 rounded-xl">{sending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}</Button>
              </div>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-[#a0a6b4]">{copy.disclaimer}</p>
          </div>
        </div>
      </section>

      {rightOpen && (
        <aside className="hidden w-[310px] shrink-0 border-l border-[#e8e9ef] bg-white 2xl:block">
          <div className="flex h-16 items-center justify-between border-b border-[#ececf2] px-4"><div><p className="text-sm font-bold">{copy.sources}</p><p className="text-[10px] text-[#9299a8]">Retrieved context</p></div><MoreHorizontal size={17} className="text-[#9aa1b0]" /></div>
          <div className="h-[calc(100%-64px)] overflow-y-auto p-3">
            {sources.length ? sources.map((source) => <button key={`${source.materialId}-${source.sourceIndex}`} onClick={() => setActiveSource(source)} className={cn("mb-2 w-full rounded-xl border p-3 text-left transition", activeSource?.chunkId === source.chunkId ? "border-[#aaa6f5] bg-[#f7f6ff]" : "border-[#e6e7ed] hover:border-[#cfccf7]")}><div className="flex items-center justify-between"><Badge className="border-[#dcdaff] bg-[#efefff] text-[#5b54da]">S{source.sourceIndex}</Badge><span className="text-[10px] font-semibold text-[#9299a8]">{source.courseCode}</span></div><p className="mt-2.5 text-xs font-bold leading-5 text-[#3b445a]">{source.materialTitle}</p>{source.pageNumber && <p className="mt-1 text-[10px] text-[#8e96a6]">{copy.page(source.pageNumber)}</p>}<p className="mt-2 line-clamp-4 text-[11px] leading-5 text-[#747d90]">{source.snippet}</p></button>) : <div className="px-4 py-14 text-center"><FileText className="mx-auto text-[#c3c7d0]" /><p className="mt-3 text-xs font-semibold text-[#7f8799]">{copy.emptySources}</p></div>}
          </div>
        </aside>
      )}
    </div>
  );
}
