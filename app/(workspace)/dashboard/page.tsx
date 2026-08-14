import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpenCheck, Bookmark, CalendarDays, MessageCircle, Sparkles, Target } from "lucide-react";
import { HeaderUser } from "@/components/app-shell";
import { CourseCard } from "@/components/course-card";
import { Badge, SectionTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getCoursesForUser, getDashboardMetrics, getRecentConversations } from "@/lib/queries";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const courses = getCoursesForUser(user);
  const metrics = getDashboardMetrics(user);
  const conversations = getRecentConversations(user.id, 5);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <SectionTitle eyebrow="Study workspace" title={`欢迎回来，${firstName}`} description="继续上次的学习，或者从课程资料开始一个新的问题。" />
        <HeaderUser user={user} />
      </div>

      <section className="relative overflow-hidden rounded-[22px] bg-[#262e4b] p-6 text-white shadow-[0_20px_50px_rgba(23,32,54,.15)] sm:p-8">
        <div className="absolute -right-8 -top-20 size-64 rounded-full bg-[#625bf6]/35 blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 size-56 rounded-full bg-[#0d9f8f]/25 blur-3xl" />
        <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
          <div>
            <Badge className="border-white/10 bg-white/10 text-[#cfccff]"><Sparkles size={12} className="mr-1.5" /> AI Tutor 已准备好</Badge>
            <h2 className="mt-4 text-2xl font-bold tracking-[-0.035em] sm:text-3xl">今天想弄懂什么？</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#bbc2d4]">选择课程与学习模式，Tutorly 会从相关资料中找到依据，再和你一起拆解问题。</p>
          </div>
          <Link
            href="/tutor"
            className="group inline-flex h-14 w-full min-w-[176px] shrink-0 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#756cff] to-[#5148dc] px-6 text-base font-extrabold text-white shadow-[0_14px_35px_rgba(98,91,246,.5)] ring-2 ring-white/15 transition-all duration-200 hover:-translate-y-0.5 hover:from-[#827aff] hover:to-[#625bf6] hover:shadow-[0_18px_42px_rgba(98,91,246,.6)] md:w-auto"
          >
            开始对话
            <span className="grid size-7 place-items-center rounded-full bg-white/20 transition-transform duration-200 group-hover:translate-x-0.5">
              <ArrowRight size={17} strokeWidth={2.5} />
            </span>
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-[-0.025em]">我的课程</h2>
          <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-semibold text-[#625bf6]">查看全部 <ArrowRight size={14} /></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.slice(0, 3).map((course) => <CourseCard key={course.id} course={course} />)}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className="app-card p-5 sm:p-6">
          <div className="flex items-center justify-between"><h2 className="font-bold tracking-[-0.02em]">最近对话</h2><MessageCircle size={18} className="text-[#8b92a4]" /></div>
          <div className="mt-4 divide-y divide-[#ececf2]">
            {conversations.length ? conversations.map((conversation) => (
              <Link key={conversation.id} href={`/tutor?conversation=${conversation.id}`} className="group flex items-center gap-3 py-3.5 first:pt-1">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f0efff] text-[#625bf6]"><Sparkles size={16} /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#333c53] group-hover:text-[#625bf6]">{conversation.title}</p><p className="mt-0.5 text-[11px] text-[#9299a9]">{conversation.courseCode || "General"} · {new Date(conversation.updatedAt).toLocaleDateString("zh-CN")}</p></div>
                <ArrowRight size={15} className="text-[#b3b8c3] group-hover:text-[#625bf6]" />
              </Link>
            )) : (
              <div className="py-9 text-center"><p className="text-sm text-[#81899b]">还没有对话记录。</p><Link href="/tutor" className="mt-2 inline-block text-sm font-semibold text-[#625bf6]">问第一个问题</Link></div>
            )}
          </div>
        </div>

        <div className="app-card p-5 sm:p-6">
          <div className="flex items-center justify-between"><h2 className="font-bold tracking-[-0.02em]">学习概览</h2><Target size={18} className="text-[#8b92a4]" /></div>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[
              [metrics.questions, "提问", MessageCircle, "#625bf6", "#efefff"],
              [metrics.conversations, "对话", BookOpenCheck, "#0d9f8f", "#eaf8f6"],
              [metrics.bookmarks, "收藏", Bookmark, "#ed8b45", "#fff4e9"],
            ].map(([value, label, Icon, color, bg]) => {
              const IconComponent = Icon as typeof MessageCircle;
              return <div key={label as string} className="rounded-xl border border-[#ececf2] p-3 text-center"><span className="mx-auto grid size-8 place-items-center rounded-lg" style={{ color: color as string, background: bg as string }}><IconComponent size={15} /></span><p className="mt-2 text-xl font-bold">{value as number}</p><p className="text-[11px] text-[#8a92a5]">{label as string}</p></div>;
            })}
          </div>
          <div className="mt-5 rounded-xl bg-[#f7f7fb] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><CalendarDays size={16} className="text-[#625bf6]" /> 今日建议</div>
            <p className="mt-2 text-xs leading-5 text-[#747d90]">选择一门进度较低的课程，让 AI 根据课件生成 5 分钟快速测验。</p>
          </div>
        </div>
      </section>
    </div>
  );
}
