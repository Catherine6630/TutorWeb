import { redirect } from "next/navigation";
import { CheckCircle2, KeyRound, LockKeyhole, UserRound } from "lucide-react";
import { Badge, SectionTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getChatModel, isAiConfigured } from "@/lib/openai";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const configured = isAiConfigured();
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Preferences" title="设置" description="查看账号、AI 连接和隐私配置。" />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="app-card p-5 sm:p-6">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#efefff] text-[#625bf6]"><UserRound size={19} /></span><div><h2 className="font-bold">账号信息</h2><p className="text-xs text-[#8a92a5]">当前登录身份</p></div></div>
          <dl className="mt-5 divide-y divide-[#ececf2] text-sm">
            <div className="flex justify-between py-3"><dt className="text-[#7a8295]">姓名</dt><dd className="font-semibold">{user.name}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-[#7a8295]">邮箱</dt><dd className="font-semibold">{user.email}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-[#7a8295]">角色</dt><dd><Badge>{user.role === "admin" ? "管理员" : "学生"}</Badge></dd></div>
          </dl>
        </section>
        <section className="app-card p-5 sm:p-6">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#eaf8f6] text-[#0d9f8f]"><KeyRound size={19} /></span><div><h2 className="font-bold">OpenAI 连接</h2><p className="text-xs text-[#8a92a5]">服务端配置状态</p></div></div>
          <div className="mt-5 rounded-xl border border-[#e7e8ef] bg-[#fafafd] p-4">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold">API 状态</p><Badge className={configured ? "border-[#d3eee9] bg-[#eefaf8] text-[#0b897b]" : "border-[#ffe0a8] bg-[#fff8e8] text-[#8f651a]"}>{configured ? <><CheckCircle2 size={12} className="mr-1" /> 已连接</> : "待配置"}</Badge></div>
            <p className="mt-3 text-xs leading-5 text-[#737c90]">当前模型：<code className="rounded bg-white px-1.5 py-1 text-[#5750dd]">{getChatModel()}</code></p>
            {!configured && <p className="mt-3 text-xs leading-5 text-[#737c90]">复制 <code>.env.example</code> 为 <code>.env.local</code>，填写 <code>OPENAI_API_KEY</code> 后重启。</p>}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#f5f5fa] p-3 text-xs leading-5 text-[#697287]"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-[#625bf6]" /> API Key 只在服务端读取，不会发送到浏览器或写入数据库。</div>
        </section>
      </div>
    </div>
  );
}
