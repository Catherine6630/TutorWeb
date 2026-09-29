import { redirect } from "next/navigation";
import { CourseCard } from "@/components/course-card";
import { SectionTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getLanguage } from "@/lib/language-server";
import { getCoursesForUser } from "@/lib/queries";

export default async function CoursesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const language = await getLanguage();
  const courses = getCoursesForUser(user);
  const copy = language === "zh" ? {
    stages: ["Stage I · 基础课程", "Stage II · 核心课程", "Stage III · 高阶课程"], other: "其他课程", title: "UoA Computer Science 课程",
    description: `浏览 Stage I–III 的 ${courses.length} 门本科课程，查看资料并在课程上下文中开始 AI 对话。`, unit: "门",
  } : {
    stages: ["Stage I · Foundations", "Stage II · Core courses", "Stage III · Advanced courses"], other: "Other courses", title: "UoA Computer Science courses",
    description: `Explore ${courses.length} undergraduate courses across Stages I–III, view their materials, and start AI conversations in course context.`, unit: "courses",
  };
  const sections = [
    ["UoA · Stage I", copy.stages[0]],
    ["UoA · Stage II", copy.stages[1]],
    ["UoA · Stage III", copy.stages[2]],
  ].map(([term, title]) => ({ title, courses: courses.filter((course) => course.term === term) }));
  const stagedCourseIds = new Set(sections.flatMap((section) => section.courses.map((course) => course.id)));
  const otherCourses = courses.filter((course) => !stagedCourseIds.has(course.id));
  if (otherCourses.length) sections.push({ title: copy.other, courses: otherCourses });

  return (
    <div className="space-y-7">
      <SectionTitle eyebrow="Courses" title={copy.title} description={copy.description} />
      <div className="space-y-9">
        {sections.map((section) => (
          <section key={section.title}>
            <div className="mb-4 flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-[-0.025em] text-[#252e47]">{section.title}</h2>
              <span className="rounded-full bg-[#ecebff] px-2.5 py-1 text-[11px] font-bold text-[#625bf6]">{section.courses.length} {copy.unit}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {section.courses.map((course) => <CourseCard key={course.id} course={course} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
