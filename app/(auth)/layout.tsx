import { redirect } from "next/navigation";
import { BrainCircuit, FileSearch, Quote } from "lucide-react";
import { Logo } from "@/components/logo";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getCurrentUser } from "@/lib/auth";
import { getLanguage } from "@/lib/language-server";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const language = await getLanguage();
  const copy = language === "zh" ? {
    eyebrow: "你的 CS 学习空间",
    title: "把每一份课件，变成随时可以对话的老师。",
    description: "有课程上下文、有原文引用，也有适合 CS 的代码与考试学习模式。",
    benefits: ["引导式讲解", "资料检索", "来源引用"],
  } : {
    eyebrow: "Your CS learning space",
    title: "Turn every course resource into a tutor you can talk to.",
    description: "Learn with course context, original-source citations, and study modes designed for CS code and exams.",
    benefits: ["Guided explanations", "Source retrieval", "Inline citations"],
  };
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <div className="fixed right-4 top-4 z-30 sm:right-6 sm:top-6"><LanguageSwitcher /></div>
      <section className="relative hidden overflow-hidden bg-[#1d2540] p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -left-24 top-1/4 size-80 rounded-full bg-[#625bf6]/25 blur-3xl" />
        <div className="absolute -right-24 bottom-0 size-96 rounded-full bg-[#0d9f8f]/20 blur-3xl" />
        <Logo className="relative z-10 text-white" />
        <div className="relative z-10 my-auto max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#a8a4ff]">{copy.eyebrow}</p>
          <h1 className="mt-5 text-5xl font-bold leading-[1.12] tracking-[-0.055em]">{copy.title}</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-[#b9c0d1]">{copy.description}</p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[[BrainCircuit, copy.benefits[0]], [FileSearch, copy.benefits[1]], [Quote, copy.benefits[2]]].map(([Icon, label]) => {
              const IconComponent = Icon as typeof BrainCircuit;
              return <div key={label as string} className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><IconComponent size={20} className="text-[#aaa6ff]" /><p className="mt-3 text-sm font-semibold">{label as string}</p></div>;
            })}
          </div>
        </div>
        <p className="relative z-10 text-xs text-[#7f8aa2]">Tutorly · Built for focused, source-grounded learning</p>
      </section>
      <section className="flex min-h-screen items-center justify-center bg-[#fbfbfd] px-5 py-12">
        <div className="w-full max-w-[430px]">
          <Logo className="mb-10 lg:hidden" />
          {children}
        </div>
      </section>
    </main>
  );
}
