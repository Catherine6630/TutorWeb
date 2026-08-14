import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  Braces,
  Check,
  DatabaseZap,
  FileText,
  GraduationCap,
  Quote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { getCurrentUser } from "@/lib/auth";

const features = [
  {
    icon: DatabaseZap,
    title: "基于你的课程资料",
    text: "课件、Tutorial 与 Past Paper 都能成为回答依据，而不是一场没有上下文的泛泛聊天。",
  },
  {
    icon: Quote,
    title: "每个重点都有来源",
    text: "回答附带文件名与页码引用。点开即可核对原文，复习更快，也更可信。",
  },
  {
    icon: Braces,
    title: "真正懂 CS 的学习模式",
    text: "从代码调试、复杂度分析，到苏格拉底引导和考试练习，针对计算机科学学习优化。",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <nav className="relative z-20 mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
        <Logo />
        <div className="hidden items-center gap-8 text-sm font-medium text-[#667085] md:flex">
          <a href="#features" className="hover:text-[#252e47]">功能</a>
          <a href="#workflow" className="hover:text-[#252e47]">如何使用</a>
          <a href="#trust" className="hover:text-[#252e47]">可信学习</a>
        </div>
        <div className="flex items-center gap-2.5">
          {!user && (
            <Link href="/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-[#525c73] hover:bg-[#f5f6fa] sm:block">
              登录
            </Link>
          )}
          <Link
            href={user ? "/dashboard" : "/register"}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#625bf6] px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(98,91,246,.24)] hover:bg-[#514ae2]"
          >
            {user ? "进入工作台" : "免费开始"}
            <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      <section className="soft-noise relative border-b border-[#ececf4] px-5 pb-24 pt-16 sm:px-8 sm:pb-32 sm:pt-24">
        <div className="subtle-grid absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.02fr_.98fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dcd9ff] bg-white/80 px-3 py-1.5 text-xs font-bold text-[#5650d7] shadow-sm backdrop-blur">
              <Sparkles size={14} />
              为 Computer Science 学习而生
            </div>
            <h1 className="max-w-3xl text-[2.8rem] font-bold leading-[1.08] tracking-[-0.058em] text-[#151d34] sm:text-[4rem] lg:text-[4.55rem]">
              不只是给答案。
              <span className="block text-[#625bf6]">真正帮你学会。</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#667085]">
              把课件、历年试卷和代码带进同一个学习空间。Tutorly 会基于你的课程内容讲解、提问、纠错，并展示每一条来源。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href={user ? "/tutor" : "/register"}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#625bf6] px-5 text-[0.95rem] font-semibold text-white shadow-[0_12px_28px_rgba(98,91,246,.25)] hover:bg-[#514ae2]"
              >
                进入 AI Tutor <ArrowRight size={17} />
              </Link>
              <Link
                href="#workflow"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#dfe1ea] bg-white px-5 text-[0.95rem] font-semibold text-[#39435a] hover:border-[#c9c8ef] hover:bg-[#fafaff]"
              >
                看看如何学习
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#6e778c]">
              {["自带演示课程", "中英双语", "资料来源可核对"].map((item) => (
                <span key={item} className="inline-flex items-center gap-2">
                  <span className="grid size-5 place-items-center rounded-full bg-[#e8f8f5] text-[#0d9f8f]"><Check size={12} /></span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[600px]">
            <div className="absolute -left-12 top-16 size-36 rounded-full bg-[#c9c5ff]/45 blur-3xl" />
            <div className="absolute -right-12 bottom-14 size-40 rounded-full bg-[#9ce4da]/35 blur-3xl" />
            <div className="relative overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-[0_35px_90px_rgba(44,39,108,.18)]">
              <div className="flex items-center justify-between border-b border-[#ececf3] px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-xl bg-[#efefff] text-[#625bf6]"><Sparkles size={17} /></span>
                  <div><p className="text-sm font-bold">AI Tutor</p><p className="text-[11px] text-[#8a92a5]">COMPSCI 220 · Trees & Traversal</p></div>
                </div>
                <span className="rounded-full bg-[#eaf8f6] px-2.5 py-1 text-[11px] font-bold text-[#0d8f80]">资料已连接</span>
              </div>
              <div className="space-y-5 bg-[#fbfbfd] p-5 sm:p-7">
                <div className="ml-auto max-w-[82%] rounded-2xl rounded-br-md bg-[#625bf6] px-4 py-3 text-sm leading-6 text-white shadow-sm">
                  为什么 BST 的最坏搜索时间会变成 O(n)？
                </div>
                <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-[#e8e9ef] bg-white p-4 text-sm leading-6 text-[#3d465d] shadow-sm">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold text-[#625bf6]"><Sparkles size={14} /> Tutorly</div>
                  <p>关键在于树的<strong>高度</strong>。搜索每一步只会进入一个子树，因此耗时是 O(h)。</p>
                  <div className="my-3 rounded-xl bg-[#f5f5fa] p-3 font-mono text-xs text-[#4e5870]">
                    平衡树：h ≈ log n → O(log n)<br />退化成链：h = n → O(n)
                  </div>
                  <p>当数据按排序顺序插入且没有再平衡时，BST 可能退化成链表。</p>
                  <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#f0efff] px-2.5 py-1.5 text-[11px] font-bold text-[#5b54da]">
                    <FileText size={12} /> S1 · Lecture 04，第 2 页
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-[#e9eaf0] pt-4">
                  {["画图解释", "给我一道练习", "对比 AVL Tree"].map((item) => (
                    <span key={item} className="rounded-full border border-[#dfe1e9] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#697287]">{item}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-7 -left-6 hidden items-center gap-3 rounded-2xl border border-white bg-white/95 p-3.5 shadow-[0_18px_45px_rgba(44,39,108,.16)] backdrop-blur sm:flex">
              <span className="grid size-10 place-items-center rounded-xl bg-[#eaf8f6] text-[#0d9f8f]"><ShieldCheck size={19} /></span>
              <div><p className="text-xs font-bold">来源可核对</p><p className="text-[11px] text-[#8a92a5]">不编造课程内容</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#625bf6]">Designed for deep learning</p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.045em] sm:text-4xl">把“问 AI”变成真正的学习过程</h2>
          <p className="mt-4 leading-7 text-[#6f788c]">内容、对话与复习不再散落在不同工具里。每一次提问，都在当前课程上下文中发生。</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-[#e8e9f0] bg-white p-6 shadow-[0_10px_35px_rgba(23,32,54,.05)]">
              <span className="grid size-11 place-items-center rounded-xl bg-[#efefff] text-[#625bf6]"><feature.icon size={21} /></span>
              <h3 className="mt-5 text-lg font-bold tracking-[-0.025em]">{feature.title}</h3>
              <p className="mt-2.5 text-sm leading-6 text-[#727b90]">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflow" className="border-y border-[#ececf3] bg-[#f8f8fc] px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0d9f8f]">Three simple steps</p>
              <h2 className="mt-4 text-3xl font-bold tracking-[-0.045em] sm:text-4xl">从资料到掌握，只需要一个学习空间</h2>
              <p className="mt-4 leading-7 text-[#6f788c]">无需重新整理所有笔记。上传原始资料，选择学习方式，然后开始一场有依据的对话。</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ["01", "连接资料", "上传课件、代码和 Past Paper，系统自动提取并建立索引。", FileText],
                ["02", "选择模式", "概念讲解、代码助手、考试分析或一步一题的 Quiz。", BookOpenCheck],
                ["03", "练到掌握", "追问、核对来源、收藏重点，并回到课程进度中继续。", GraduationCap],
              ].map(([number, title, text, Icon]) => {
                const IconComponent = Icon as typeof FileText;
                return (
                  <article key={number as string} className="rounded-2xl border border-[#e5e6ee] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between"><span className="text-xs font-bold text-[#a0a6b5]">{number as string}</span><IconComponent size={18} className="text-[#625bf6]" /></div>
                    <h3 className="mt-7 font-bold">{title as string}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#727b90]">{text as string}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="trust" className="px-5 py-24 sm:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-[#1d2540] px-6 py-10 text-white shadow-[0_30px_75px_rgba(23,32,54,.2)] sm:px-12 sm:py-14">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-[#c9c6ff]"><ShieldCheck size={14} /> Built for trustworthy learning</span>
              <h2 className="mt-5 max-w-2xl text-3xl font-bold tracking-[-0.045em]">知道答案从哪里来，也知道什么时候资料不够。</h2>
              <p className="mt-4 max-w-2xl leading-7 text-[#b5bdd0]">Tutorly 会区分课程资料和通用知识；没有依据时明确说明，不虚构页码、评分标准或课程要求。</p>
            </div>
            <Link
              href={user ? "/dashboard" : "/register"}
              className="group inline-flex h-14 w-full min-w-[176px] items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#756cff] to-[#5148dc] px-6 text-base font-extrabold text-white shadow-[0_14px_35px_rgba(98,91,246,.48)] ring-2 ring-white/15 transition-all duration-200 hover:-translate-y-0.5 hover:from-[#827aff] hover:to-[#625bf6] hover:shadow-[0_18px_42px_rgba(98,91,246,.58)] sm:w-auto"
            >
              {user ? "继续学习" : "创建学习空间"}
              <span className="grid size-7 place-items-center rounded-full bg-white/20 transition-transform duration-200 group-hover:translate-x-0.5">
                <ArrowRight size={17} strokeWidth={2.5} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#ececf3] bg-[#fbfbfd] px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-[#7b8497] sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p>AI learning workspace for computer-science students.</p>
        </div>
      </footer>
    </main>
  );
}
