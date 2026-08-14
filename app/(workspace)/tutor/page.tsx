import { redirect } from "next/navigation";
import { TutorWorkspace } from "@/components/tutor-workspace";
import { getCurrentUser } from "@/lib/auth";
import { isAiConfigured } from "@/lib/openai";
import { getConversation, getCoursesForUser, getMaterialsForUser, getRecentConversations } from "@/lib/queries";

export default async function TutorPage({ searchParams }: { searchParams: Promise<{ course?: string; conversation?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const params = await searchParams;
  const courses = getCoursesForUser(user);
  const materials = getMaterialsForUser(user);
  const conversations = getRecentConversations(user.id, 40);
  const initialConversation = params.conversation ? getConversation(user.id, params.conversation) : null;
  return <TutorWorkspace courses={courses} materials={materials} initialConversations={conversations} initialConversation={initialConversation} initialCourseId={params.course} aiConfigured={isAiConfigured()} />;
}
