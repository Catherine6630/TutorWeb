import { redirect } from "next/navigation";
import { MaterialLibrary } from "@/components/material-library";
import { SectionTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getLanguage } from "@/lib/language-server";
import { getCoursesForUser, getMaterialsForUser } from "@/lib/queries";

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ course?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const [courses, materials, params] = await Promise.all([
    Promise.resolve(getCoursesForUser(user)),
    Promise.resolve(getMaterialsForUser(user)),
    searchParams,
  ]);
  const language = await getLanguage();
  const copy = language === "zh" ? {
    title: "课程资料库", description: "管理课件、Tutorial、Past Paper 与代码文件。准备完成的资料会自动参与 AI 检索。",
  } : {
    title: "Course materials", description: "Manage lectures, tutorials, past papers, and code files. Ready materials are automatically included in AI retrieval.",
  };
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Knowledge base" title={copy.title} description={copy.description} />
      <MaterialLibrary user={user} courses={courses} materials={materials} initialCourse={params.course || "all"} />
    </div>
  );
}
