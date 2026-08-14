import { redirect } from "next/navigation";
import { BrainCircuit, FileSearch, Quote } from "lucide-react";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden overflow-hidden bg-[#1d2540] p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -left-24 top-1/4 size-80 rounded-full bg-[#625bf6]/25 blur-3xl" />
        <div className="absolute -right-24 bottom-0 size-96 rounded-full bg-[#0d9f8f]/20 blur-3xl" />
        <Logo className="relative z-10 text-white" />
        <div className="relative z-10 my-auto max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#a8a4ff]">Your CS learning space</p>
          <h1 className="mt-5 text-5xl font-bold leading-[1.12] tracking-[-0.055em]">把每一份课件，变成随时可以对话的老师。</h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-[#b9c0d1]">有课程上下文、有原文引用，也有适合 CS 的代码与考试学习模式。</p>
          <div className="mt-10 grid grid-cols-3 gap-3">
            {[[BrainCircuit, "引导式讲解"], [FileSearch, "资料检索"], [Quote, "来源引用"]].map(([Icon, label]) => {
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
