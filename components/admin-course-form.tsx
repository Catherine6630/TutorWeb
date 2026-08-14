"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, X } from "lucide-react";
import { Button, Input } from "@/components/ui";

export function AdminCourseForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/admin/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = (await response.json()) as { error?: string };
    setLoading(false);
    if (!response.ok) return setError(result.error || "创建失败。");
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus size={16} /> 新建课程</Button>
      {open && <div className="fixed inset-0 z-[70] grid place-items-center bg-[#172036]/40 p-4 backdrop-blur-sm"><button className="absolute inset-0" onClick={() => setOpen(false)} aria-label="关闭" /><form onSubmit={submit} className="relative w-full max-w-lg rounded-[22px] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold">创建课程</h2><p className="mt-1 text-xs text-[#7f8799]">新注册学生会自动加入所有未归档课程。</p></div><button type="button" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-lg hover:bg-[#f1f2f6]"><X size={17} /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-[#555e73]">课程代码<Input name="code" required placeholder="COMP401" className="mt-1.5" /></label><label className="text-xs font-semibold text-[#555e73]">学期<Input name="term" placeholder="Semester 1 · 2026" className="mt-1.5" /></label></div><label className="mt-3 block text-xs font-semibold text-[#555e73]">课程名称<Input name="name" required placeholder="Machine Learning" className="mt-1.5" /></label><label className="mt-3 block text-xs font-semibold text-[#555e73]">简介<textarea name="description" required rows={3} className="mt-1.5 w-full resize-none rounded-xl border border-[#dfe2ea] p-3 text-sm outline-none focus:border-[#817bf7]" /></label><label className="mt-3 block text-xs font-semibold text-[#555e73]">主题色<Input name="accent" type="color" defaultValue="#625bf6" className="mt-1.5 p-1" /></label>{error && <p className="mt-3 text-xs text-[#b53c3c]">{error}</p>}<div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>取消</Button><Button type="submit" disabled={loading}>{loading ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />} 创建</Button></div></form></div>}
    </>
  );
}
