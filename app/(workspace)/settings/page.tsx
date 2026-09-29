import { redirect } from "next/navigation";
import { CheckCircle2, KeyRound, LockKeyhole, UserRound } from "lucide-react";
import { Badge, SectionTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getLanguage } from "@/lib/language-server";
import { getChatModel, isAiConfigured } from "@/lib/openai";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const language = await getLanguage();
  const configured = isAiConfigured();
  const copy = language === "zh" ? {
    title: "设置", description: "查看账号、AI 连接和隐私配置。", account: "账号信息", identity: "当前登录身份", name: "姓名", email: "邮箱", role: "角色", admin: "管理员", student: "学生",
    connection: "OpenAI 连接", serverStatus: "服务端配置状态", apiStatus: "API 状态", connected: "已连接", pending: "待配置", model: "当前模型", setup: "复制 .env.example 为 .env.local，填写 OPENAI_API_KEY 后重启。", privacy: "API Key 只在服务端读取，不会发送到浏览器或写入数据库。",
  } : {
    title: "Settings", description: "Review your account, AI connection, and privacy configuration.", account: "Account information", identity: "Current signed-in identity", name: "Name", email: "Email", role: "Role", admin: "Administrator", student: "Student",
    connection: "OpenAI connection", serverStatus: "Server configuration status", apiStatus: "API status", connected: "Connected", pending: "Not configured", model: "Current model", setup: "Copy .env.example to .env.local, add OPENAI_API_KEY, and restart the server.", privacy: "The API key is read only on the server. It is never sent to the browser or stored in the database.",
  };
  return (
    <div className="space-y-6">
      <SectionTitle eyebrow="Preferences" title={copy.title} description={copy.description} />
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="app-card p-5 sm:p-6">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#efefff] text-[#625bf6]"><UserRound size={19} /></span><div><h2 className="font-bold">{copy.account}</h2><p className="text-xs text-[#8a92a5]">{copy.identity}</p></div></div>
          <dl className="mt-5 divide-y divide-[#ececf2] text-sm">
            <div className="flex justify-between py-3"><dt className="text-[#7a8295]">{copy.name}</dt><dd className="font-semibold">{user.name}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-[#7a8295]">{copy.email}</dt><dd className="font-semibold">{user.email}</dd></div>
            <div className="flex justify-between py-3"><dt className="text-[#7a8295]">{copy.role}</dt><dd><Badge>{user.role === "admin" ? copy.admin : copy.student}</Badge></dd></div>
          </dl>
        </section>
        <section className="app-card p-5 sm:p-6">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#eaf8f6] text-[#0d9f8f]"><KeyRound size={19} /></span><div><h2 className="font-bold">{copy.connection}</h2><p className="text-xs text-[#8a92a5]">{copy.serverStatus}</p></div></div>
          <div className="mt-5 rounded-xl border border-[#e7e8ef] bg-[#fafafd] p-4">
            <div className="flex items-center justify-between"><p className="text-sm font-semibold">{copy.apiStatus}</p><Badge className={configured ? "border-[#d3eee9] bg-[#eefaf8] text-[#0b897b]" : "border-[#ffe0a8] bg-[#fff8e8] text-[#8f651a]"}>{configured ? <><CheckCircle2 size={12} className="mr-1" /> {copy.connected}</> : copy.pending}</Badge></div>
            <p className="mt-3 text-xs leading-5 text-[#737c90]">{copy.model}: <code className="rounded bg-white px-1.5 py-1 text-[#5750dd]">{getChatModel()}</code></p>
            {!configured && <p className="mt-3 text-xs leading-5 text-[#737c90]">{copy.setup}</p>}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#f5f5fa] p-3 text-xs leading-5 text-[#697287]"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-[#625bf6]" /> {copy.privacy}</div>
        </section>
      </div>
    </div>
  );
}
