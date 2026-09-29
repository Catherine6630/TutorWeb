"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Plus, X } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useLanguage } from "@/components/language-provider";

export function AdminCourseForm() {
  const router = useRouter();
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const copy = language === "zh" ? {
    failed: "创建失败。", newCourse: "新建课程", close: "关闭", title: "创建课程", help: "新注册学生会自动加入所有未归档课程。", code: "课程代码", term: "学期", name: "课程名称", description: "简介", accent: "主题色", cancel: "取消", create: "创建",
  } : {
    failed: "Could not create the course.", newCourse: "New course", close: "Close", title: "Create course", help: "New students are automatically enrolled in every active course.", code: "Course code", term: "Term", name: "Course name", description: "Description", accent: "Accent colour", cancel: "Cancel", create: "Create",
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/admin/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const result = (await response.json()) as { error?: string };
    setLoading(false);
    if (!response.ok) return setError(result.error || copy.failed);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus size={16} /> {copy.newCourse}</Button>
      {open && <div className="fixed inset-0 z-[70] grid place-items-center bg-[#172036]/40 p-4 backdrop-blur-sm"><button className="absolute inset-0" onClick={() => setOpen(false)} aria-label={copy.close} /><form onSubmit={submit} className="relative w-full max-w-lg rounded-[22px] bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><h2 className="text-lg font-bold">{copy.title}</h2><p className="mt-1 text-xs text-[#7f8799]">{copy.help}</p></div><button type="button" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-lg hover:bg-[#f1f2f6]"><X size={17} /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold text-[#555e73]">{copy.code}<Input name="code" required placeholder="COMP401" className="mt-1.5" /></label><label className="text-xs font-semibold text-[#555e73]">{copy.term}<Input name="term" placeholder="Semester 1 · 2026" className="mt-1.5" /></label></div><label className="mt-3 block text-xs font-semibold text-[#555e73]">{copy.name}<Input name="name" required placeholder="Machine Learning" className="mt-1.5" /></label><label className="mt-3 block text-xs font-semibold text-[#555e73]">{copy.description}<textarea name="description" required rows={3} className="mt-1.5 w-full resize-none rounded-xl border border-[#dfe2ea] p-3 text-sm outline-none focus:border-[#817bf7]" /></label><label className="mt-3 block text-xs font-semibold text-[#555e73]">{copy.accent}<Input name="accent" type="color" defaultValue="#625bf6" className="mt-1.5 p-1" /></label>{error && <p className="mt-3 text-xs text-[#b53c3c]">{error}</p>}<div className="mt-5 flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>{copy.cancel}</Button><Button type="submit" disabled={loading}>{loading ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />} {copy.create}</Button></div></form></div>}
    </>
  );
}
