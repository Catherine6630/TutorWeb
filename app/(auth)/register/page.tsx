import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { getLanguage } from "@/lib/language-server";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage() {
  const language = await getLanguage();
  const copy = language === "zh" ? {
    eyebrow: "开始学习", title: "创建你的学习空间", description: "注册后会自动加入演示课程，你可以立即体验完整流程。", legal: "创建账号即表示你只会上传自己有权使用的学习资料。",
  } : {
    eyebrow: "Start learning", title: "Create your learning space", description: "Your new account includes the demo courses, so you can explore the full workflow immediately.", legal: "By creating an account, you agree to upload only learning materials you are authorised to use.",
  };
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#625bf6]">{copy.eyebrow}</p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em]">{copy.title}</h1>
      <p className="mb-8 mt-2 text-sm leading-6 text-[#747d90]">{copy.description}</p>
      <AuthForm mode="register" />
      <p className="mt-6 text-center text-[11px] leading-5 text-[#9299a8]">{copy.legal}</p>
    </div>
  );
}
