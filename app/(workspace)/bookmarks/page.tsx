import Link from "next/link";
import { redirect } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowRight, Bookmark, Sparkles } from "lucide-react";
import { Badge, SectionTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getBookmarks } from "@/lib/queries";
import { truncate } from "@/lib/utils";

export default async function BookmarksPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const bookmarks = getBookmarks(user.id);
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Saved answers" title="我的收藏" description="保存值得反复复习的解释、代码与答题思路。" />
      {bookmarks.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {bookmarks.map((bookmark) => (
            <article key={bookmark.messageId} className="app-card flex flex-col p-5">
              <div className="flex items-center justify-between"><Badge className="border-[#dcdaff] bg-[#efefff] text-[#5b54da]">{bookmark.courseCode || "General"}</Badge><Bookmark size={16} className="fill-[#625bf6] text-[#625bf6]" /></div>
              <h2 className="mt-4 text-sm font-bold text-[#343d54]">{bookmark.conversationTitle}</h2>
              <div className="prose-tutor mt-3 line-clamp-[9] text-sm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{truncate(bookmark.content, 700)}</ReactMarkdown></div>
              <Link href={`/tutor?conversation=${bookmark.conversationId}`} className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-[#625bf6]">回到对话 <ArrowRight size={14} /></Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="app-card py-20 text-center"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#efefff] text-[#625bf6]"><Sparkles size={21} /></span><h2 className="mt-4 font-bold">还没有收藏</h2><p className="mt-1 text-sm text-[#81899b]">在 AI 回答下点击书签图标，重点内容会保存在这里。</p><Link href="/tutor" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#625bf6]">开始对话 <ArrowRight size={14} /></Link></div>
      )}
    </div>
  );
}
