import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, Database, FileText, MessageCircle, Sparkles, Users } from "lucide-react";
import { AdminCourseForm } from "@/components/admin-course-form";
import { Badge, SectionTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getAdminMetrics, getCoursesForUser, getMaterialsForUser } from "@/lib/queries";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/dashboard");
  const metrics = getAdminMetrics();
  const courses = getCoursesForUser(user);
  const materials = getMaterialsForUser(user).slice(0, 6);
  const cards = [[metrics.users, "用户", Users, "#625bf6", "#efefff"], [metrics.courses, "课程", BookOpen, "#0d9f8f", "#eaf8f6"], [metrics.materials, "资料", FileText, "#ed8b45", "#fff4e9"], [metrics.conversations, "对话", MessageCircle, "#d45c83", "#fff0f5"]] as const;
  return (
    <div className="space-y-7">
      <SectionTitle eyebrow="Administration" title="管理后台" description="管理课程知识库，并查看平台的基础使用情况。" action={<AdminCourseForm />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([value, label, Icon, color, background]) => <div key={label} className="app-card flex items-center gap-4 p-5"><span className="grid size-11 place-items-center rounded-xl" style={{ color, background }}><Icon size={20} /></span><div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-[#858d9f]">{label}</p></div></div>)}</div>
      <div className="grid gap-5 xl:grid-cols-[1fr_.8fr]">
        <section className="app-card p-5 sm:p-6"><div className="flex items-center justify-between"><div><h2 className="font-bold">最近资料</h2><p className="mt-1 text-xs text-[#8a92a5]">解析和索引状态</p></div><Link href="/library" className="text-sm font-semibold text-[#625bf6]">管理全部</Link></div><div className="mt-4 divide-y divide-[#ececf2]">{materials.map((material) => <div key={material.id} className="flex items-center gap-3 py-3"><span className="grid size-9 place-items-center rounded-xl bg-[#f0efff] text-[#625bf6]"><FileText size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{material.title}</p><p className="text-[11px] text-[#9097a7]">{material.courseCode} · {material.chunkCount} chunks</p></div><Badge className={material.processingStatus === "ready" ? "border-[#d3eee9] bg-[#eefaf8] text-[#0b897b]" : ""}>{material.processingStatus}</Badge></div>)}</div></section>
        <section className="app-card p-5 sm:p-6"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#efefff] text-[#625bf6]"><Database size={18} /></span><div><h2 className="font-bold">知识库状态</h2><p className="text-xs text-[#8a92a5]">{metrics.materials} 份资料可管理</p></div></div><div className="mt-5 space-y-3">{courses.map((course) => <div key={course.id} className="rounded-xl border border-[#e8e9ef] p-3.5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold" style={{ color: course.accent }}>{course.code}</p><p className="mt-1 text-sm font-semibold">{course.name}</p></div><Badge>{course.materialCount} 份</Badge></div></div>)}</div><Link href="/library" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#625bf6]">上传或更新资料 <ArrowRight size={14} /></Link></section>
      </div>
      <div className="rounded-xl border border-[#dedcff] bg-[#f5f4ff] px-4 py-3 text-xs leading-5 text-[#5b54a8]"><Sparkles size={14} className="mr-2 inline" />AI 模型和系统提示通过环境变量及服务端代码配置，密钥不会展示在后台页面。</div>
    </div>
  );
}
