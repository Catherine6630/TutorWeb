"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useLanguage } from "@/components/language-provider";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const { language } = useLanguage();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const copy = language === "zh" ? {
    failed: "操作失败，请稍后重试。", name: "姓名", namePlaceholder: "你的姓名", email: "邮箱", password: "密码",
    passwordNew: "至少 8 位，包含字母和数字", passwordExisting: "输入密码", hide: "隐藏密码", show: "显示密码",
    login: "登录", create: "创建账号", noAccount: "还没有账号？", hasAccount: "已经有账号？", register: "免费注册", directLogin: "直接登录",
  } : {
    failed: "Something went wrong. Please try again.", name: "Name", namePlaceholder: "Your name", email: "Email", password: "Password",
    passwordNew: "At least 8 characters with letters and numbers", passwordExisting: "Enter your password", hide: "Hide password", show: "Show password",
    login: "Log in", create: "Create account", noAccount: "New to Tutorly?", hasAccount: "Already have an account?", register: "Create one free", directLogin: "Log in instead",
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const data = new FormData(event.currentTarget);
    const body = Object.fromEntries(data.entries());
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || copy.failed);
      router.push("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : copy.failed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "register" && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-[#3d465d]">{copy.name}</span>
          <Input name="name" autoComplete="name" placeholder={copy.namePlaceholder} required minLength={2} />
        </label>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-[#3d465d]">{copy.email}</span>
        <Input name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-[#3d465d]">{copy.password}</span>
        <span className="relative block">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "register" ? copy.passwordNew : copy.passwordExisting}
            required
            minLength={8}
            className="pr-11"
          />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-1 grid size-9 place-items-center rounded-lg text-[#7a8295] hover:bg-[#f1f2f6]" aria-label={showPassword ? copy.hide : copy.show}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </span>
      </label>
      {error && <p role="alert" className="rounded-xl border border-[#ffd1d1] bg-[#fff4f4] px-3.5 py-3 text-sm text-[#b53c3c]">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <LoaderCircle size={18} className="animate-spin" /> : <>{mode === "login" ? copy.login : copy.create}<ArrowRight size={17} /></>}
      </Button>
      <p className="pt-1 text-center text-sm text-[#7b8497]">
        {mode === "login" ? copy.noAccount : copy.hasAccount}{" "}
        <Link href={mode === "login" ? "/register" : "/login"} className="font-semibold text-[#625bf6] hover:underline">
          {mode === "login" ? copy.register : copy.directLogin}
        </Link>
      </p>
    </form>
  );
}
