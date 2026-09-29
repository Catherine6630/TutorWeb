import Link from "next/link";
import { redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, Bookmark, Sparkles } from "lucide-react";
import { Badge, SectionTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getLanguage } from "@/lib/language-server";
import { getBookmarks } from "@/lib/queries";
import { truncate } from "@/lib/utils";

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const language = await getLanguage();
  const bookmarks = getBookmarks(user.id);
  const copy = language === "zh" ? {
    title: "我的收藏", description: "保存值得反复复习的解释、代码与答题思路。", return: "回到对话", empty: "还没有收藏", emptyText: "在 AI 回答下点击书签图标，重点内容会保存在这里。", start: "开始对话",
  } : {
    title: "My bookmarks", description: "Save explanations, code, and solution strategies worth revisiting.", return: "Return to conversation", empty: "No bookmarks yet", emptyText: "Use the bookmark icon beneath an AI answer to save important content here.", start: "Start a conversation",
  };
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Saved answers" title={copy.title} description={copy.description} />
      {bookmarks.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {bookmarks.map((bookmark) => (
            <article key={bookmark.messageId} className="app-card flex flex-col p-5">
              <div className="flex items-center justify-between"><Badge className="border-[#dcdaff] bg-[#efefff] text-[#5b54da]">{bookmark.courseCode || "General"}</Badge><Bookmark size={16} className="fill-[#625bf6] text-[#625bf6]" /></div>
              <h2 className="mt-4 text-sm font-bold text-[#343d54]">{bookmark.conversationTitle}</h2>
              <div className="prose-tutor mt-3 line-clamp-[9] text-sm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{truncate(bookmark.content, 700)}</ReactMarkdown></div>
              <Link href={`/tutor?conversation=${bookmark.conversationId}`} className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-[#625bf6]">{copy.return} <ArrowRight size={14} /></Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="app-card py-20 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#efefff] text-[#625bf6]"><Sparkles size={21} /></span><h2 className="mt-4 font-bold">{copy.empty}</h2><p className="mt-1 text-sm text-[#81899b]">{copy.emptyText}</p><Link href="/tutor" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#625bf6]">{copy.start} <ArrowRight size={14} /></Link></div>
      )}
    </div>
  );
}
