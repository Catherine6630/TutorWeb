import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, FileCode2, FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getLanguage } from "@/lib/language-server";
import { getCourseForUser, getMaterialsForUser } from "@/lib/queries";

const typeIcon = (type: string) => (type === "code" ? FileCode2 : FileText);

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const language = await getLanguage();
  const { courseId } = await params;
  const course = getCourseForUser(user, courseId);
  if (!course) notFound();
  const materials = getMaterialsForUser(user, courseId);
  const copy = language === "zh" ? {
    back: "返回课程", materials: "份资料", ask: "向 AI 提问", courseMaterials: "课程资料", retrieval: "AI 会优先检索这里的内容", openLibrary: "打开资料库",
    unknownYear: "未标注年份", chunks: "个知识片段", indexed: "已索引", noMaterials: "这门课程还没有资料。", progress: "学习进度", complete: "已完成", progressText: "通过课程对话和 Quiz 练习持续推进。真实学习事件接入后可替换演示进度。",
  } : {
    back: "Back to courses", materials: "materials", ask: "Ask AI", courseMaterials: "Course materials", retrieval: "AI searches these materials first", openLibrary: "Open library",
    unknownYear: "Year not specified", chunks: "knowledge chunks", indexed: "Indexed", noMaterials: "This course does not have any materials yet.", progress: "Learning progress", complete: "Complete", progressText: "Keep moving forward with course conversations and quiz practice. Demo progress can be replaced when real learning events are connected.",
  };

  return (
    <div className="space-y-7">
      <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#737c90] hover:text-[#625bf6]"><ArrowLeft size={15} /> {copy.back}</Link>
      <section className="relative overflow-hidden rounded-[24px] p-6 text-white shadow-lg sm:p-8" style={{ background: `linear-gradient(125deg, ${course.accent}, #282f4d 78%)` }}>
        <div className="absolute -right-12 -top-20 size-72 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <Badge className="border-white/15 bg-white/10 text-white">{course.code}</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-[-0.045em] sm:text-4xl">{course.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">{course.description}</p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs font-medium text-white/75"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> {course.term}</span><span className="inline-flex items-center gap-1.5"><BookOpen size={14} /> {course.materialCount} {copy.materials}</span></div>
          </div>
          <Link href={`/tutor?course=${course.id}`} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#2d3550] shadow-md hover:bg-[#f5f4ff]"><Sparkles size={16} className="text-[#625bf6]" /> {copy.ask} <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className="app-card p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="font-bold">{copy.courseMaterials}</h2><p className="mt-1 text-xs text-[#8a92a5]">{copy.retrieval}</p></div><Link href={`/library?course=${course.id}`} className="text-sm font-semibold text-[#625bf6]">{copy.openLibrary}</Link></div>
          <div className="mt-4 divide-y divide-[#ececf2]">
            {materials.map((material) => {
              const Icon = typeIcon(material.materialType);
              return (
                <div key={material.id} className="flex items-center gap-3 py-3.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#f0efff] text-[#625bf6]"><Icon size={18} /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#333c53]">{material.title}</p><p className="mt-0.5 text-[11px] text-[#9097a7]">{material.year || copy.unknownYear} · {material.chunkCount} {copy.chunks}</p></div>
                  <Badge className={material.processingStatus === "ready" ? "border-[#d3eee9] bg-[#eefaf8] text-[#0b897b]" : ""}>{material.processingStatus === "ready" ? copy.indexed : material.processingStatus}</Badge>
                </div>
              );
            })}
            {!materials.length && <p className="py-9 text-center text-sm text-[#868ea0]">{copy.noMaterials}</p>}
          </div>
        </div>

        <div className="app-card p-5 sm:p-6">
          <h2 className="font-bold">{copy.progress}</h2>
          <div className="mx-auto mt-7 grid size-36 place-items-center rounded-full p-3" style={{ background: `conic-gradient(${course.accent} ${course.progress}%, #eceef3 0)` }}>
            <div className="grid size-full place-items-center rounded-full bg-white text-center"><div><p className="text-3xl font-bold">{course.progress}%</p><p className="text-[11px] text-[#8a92a5]">{copy.complete}</p></div></div>
          </div>
          <p className="mt-6 text-center text-xs leading-5 text-[#788195]">{copy.progressText}</p>
        </div>
      </section>
    </div>
  );
}
