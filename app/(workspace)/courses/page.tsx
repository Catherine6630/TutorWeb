import { redirect } from "next/navigation";
import { CourseCard } from "@/components/course-card";
import { SectionTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getCoursesForUser } from "@/lib/queries";

export default async function CoursesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const courses = getCoursesForUser(user);
  return (
    <div className="space-y-7">
      <SectionTitle eyebrow="Courses" title="我的课程" description="查看课程资料、学习进度，并在课程上下文中开始 AI 对话。" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => <CourseCard key={course.id} course={course} />)}
      </div>
    </div>
  );
}
