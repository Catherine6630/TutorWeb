"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button, Input } from "@/components/ui";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      if (!response.ok) throw new Error(result.error || "操作失败，请稍后重试。");
      router.push("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "操作失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "register" && (
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-[#3d465d]">姓名</span>
          <Input name="name" autoComplete="name" placeholder="你的姓名" required minLength={2} />
        </label>
      )}
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-[#3d465d]">邮箱</span>
        <Input name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-[#3d465d]">密码</span>
        <span className="relative block">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "register" ? "至少 8 位，包含字母和数字" : "输入密码"}
            required
            minLength={8}
            className="pr-11"
          />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-1 grid size-9 place-items-center rounded-lg text-[#7a8295] hover:bg-[#f1f2f6]" aria-label={showPassword ? "隐藏密码" : "显示密码"}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </span>
      </label>
      {error && <p role="alert" className="rounded-xl border border-[#ffd1d1] bg-[#fff4f4] px-3.5 py-3 text-sm text-[#b53c3c]">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <LoaderCircle size={18} className="animate-spin" /> : <>{mode === "login" ? "登录" : "创建账号"}<ArrowRight size={17} /></>}
      </Button>
      <p className="pt-1 text-center text-sm text-[#7b8497]">
        {mode === "login" ? "还没有账号？" : "已经有账号？"}{" "}
        <Link href={mode === "login" ? "/register" : "/login"} className="font-semibold text-[#625bf6] hover:underline">
          {mode === "login" ? "免费注册" : "直接登录"}
        </Link>
      </p>
    </form>
  );
}
