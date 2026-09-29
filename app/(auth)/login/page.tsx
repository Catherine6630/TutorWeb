import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { getLanguage } from "@/lib/language-server";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  const language = await getLanguage();
  const copy = language === "zh" ? {
    eyebrow: "欢迎回来", title: "继续你的学习", description: "登录后查看课程、资料和最近的 AI 对话。", student: "演示学生", admin: "演示管理员",
  } : {
    eyebrow: "Welcome back", title: "Continue learning", description: "Log in to see your courses, materials, and recent AI conversations.", student: "Demo student", admin: "Demo administrator",
  };
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#625bf6]">{copy.eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em]">{copy.title}</h1>
      <p className="mb-8 mt-2 text-sm leading-6 text-[#747d90]">{copy.description}</p>
      <AuthForm mode="login" />
      <div className="mt-7 rounded-xl border border-[#e4e5ed] bg-white p-3.5 text-xs leading-5 text-[#6f788c]">
        {copy.student}: <strong>student@tutorly.local</strong> / <strong>Student123!</strong><br />
        {copy.admin}: <strong>admin@tutorly.local</strong> / <strong>Admin123!</strong>
      </div>
    </div>
  );
}
