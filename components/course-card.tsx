"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Code2,
  Cpu,
  Database,
  Globe2,
  GraduationCap,
  ImageIcon,
  MonitorCog,
  Network,
  Search,
  ShieldCheck,
  Sigma,
  TerminalSquare,
  Users,
  Workflow,
} from "lucide-react";
import type { Course } from "@/lib/models";
import { useLanguage } from "@/components/language-provider";

const icons = {
  "book-open": BookOpen,
  "code-2": Code2,
  cpu: Cpu,
  database: Database,
  globe: Globe2,
  "graduation-cap": GraduationCap,
  image: ImageIcon,
  "monitor-cog": MonitorCog,
  network: Network,
  search: Search,
  "shield-check": ShieldCheck,
  sigma: Sigma,
  "terminal-square": TerminalSquare,
  users: Users,
  workflow: Workflow,
};

export function CourseCard({ course }: { course: Course }) {
  const { language } = useLanguage();
  const Icon = icons[course.icon as keyof typeof icons] ?? BookOpen;
  return (
    <Link href={`/courses/${course.id}`} className="group app-card flex min-h-[230px] flex-col p-5 transition hover:-translate-y-0.5 hover:border-[#d6d4fb] hover:shadow-[0_16px_40px_rgba(44,39,108,.09)]">
      <div className="flex items-start justify-between">
        <span className="grid size-11 place-items-center rounded-xl text-white shadow-sm" style={{ background: course.accent }}><Icon size={21} /></span>
        <ArrowUpRight size={18} className="text-[#a6adba] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#625bf6]" />
      </div>
      <p className="mt-5 text-xs font-bold tracking-[0.08em]" style={{ color: course.accent }}>{course.code}</p>
      <h3 className="mt-1 text-[1.05rem] font-bold tracking-[-0.025em] text-[#252e47]">{course.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#7a8295]">{course.description}</p>
      <div className="mt-auto pt-5">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-[#8a92a5]"><span>{language === "zh" ? "学习进度" : "Learning progress"}</span><span>{course.progress ?? 0}%</span></div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[#eceef3]"><div className="h-full rounded-full" style={{ width: `${course.progress ?? 0}%`, background: course.accent }} /></div>
      </div>
    </Link>
  );
}
