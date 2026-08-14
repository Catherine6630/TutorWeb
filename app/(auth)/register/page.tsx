import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "注册" };

export default function RegisterPage() {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#625bf6]">Start learning</p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em]">创建你的学习空间</h1>
      <p className="mb-8 mt-2 text-sm leading-6 text-[#747d90]">注册后会自动加入演示课程，你可以立即体验完整流程。</p>
      <AuthForm mode="register" />
      <p className="mt-6 text-center text-[11px] leading-5 text-[#9299a8]">创建账号即表示你只会上传自己有权使用的学习资料。</p>
    </div>
  );
}
