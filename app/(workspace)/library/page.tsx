import { redirect } from "next/navigation";
import { MaterialLibrary } from "@/components/material-library";
import { SectionTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getCoursesForUser, getMaterialsForUser } from "@/lib/queries";

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const [courses, materials, params] = await Promise.all([
    Promise.resolve(getCoursesForUser(user)),
    Promise.resolve(getMaterialsForUser(user)),
    searchParams,
  ]);
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Knowledge base" title="课程资料库" description="管理课件、Tutorial、Past Paper 与代码文件。准备完成的资料会自动参与 AI 检索。" />
      <MaterialLibrary user={user} courses={courses} materials={materials} initialCourse={params.course || "all"} />
    </div>
  );
}
