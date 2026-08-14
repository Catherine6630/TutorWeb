import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "登录" };

export default function LoginPage() {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#625bf6]">Welcome back</p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em]">继续你的学习</h1>
      <p className="mb-8 mt-2 text-sm leading-6 text-[#747d90]">登录后查看课程、资料和最近的 AI 对话。</p>
      <AuthForm mode="login" />
      <div className="mt-7 rounded-xl border border-[#e4e5ed] bg-white p-3.5 text-xs leading-5 text-[#6f788c]">
        演示学生：<strong>student@tutorly.local</strong> / <strong>Student123!</strong><br />
        演示管理员：<strong>admin@tutorly.local</strong> / <strong>Admin123!</strong>
      </div>
    </div>
  );
}
