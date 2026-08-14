"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookMarked,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/lib/models";

const navigation = [
  { href: "/dashboard", label: "学习首页", icon: LayoutDashboard },
  { href: "/courses", label: "我的课程", icon: GraduationCap },
  { href: "/tutor", label: "AI Tutor", icon: Sparkles },
  { href: "/library", label: "资料库", icon: Library },
  { href: "/bookmarks", label: "收藏", icon: BookMarked },
];

function Navigation({
  user,
  onNavigate,
}: {
  user: AuthUser;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const active = (href: string) => pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center px-5"><Logo /></div>
      <div className="px-3">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a0a6b5]">Workspace</p>
        <nav className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition",
                active(item.href)
                  ? "bg-[#efefff] text-[#5750dd]"
                  : "text-[#667085] hover:bg-[#f5f6fa] hover:text-[#2b344b]",
              )}
            >
              <item.icon size={18} strokeWidth={active(item.href) ? 2.3 : 1.9} />
              {item.label}
              {item.href === "/tutor" && <span className="ml-auto rounded-full bg-[#625bf6] px-1.5 py-0.5 text-[9px] font-bold text-white">AI</span>}
            </Link>
          ))}
        </nav>
      </div>

      {user.role === "admin" && (
        <div className="mt-7 px-3">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#a0a6b5]">Management</p>
          <Link
            href="/admin"
            onClick={onNavigate}
            className={cn(
              "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition",
              pathname.startsWith("/admin") ? "bg-[#eaf8f6] text-[#087f72]" : "text-[#667085] hover:bg-[#f5f6fa]",
            )}
          >
            <ShieldCheck size={18} /> 管理后台
          </Link>
        </div>
      )}

      <div className="mt-auto p-3">
        <Link href="/settings" onClick={onNavigate} className="mb-2 flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#737c90] hover:bg-[#f5f6fa]">
          <Settings size={17} /> 设置
        </Link>
        <div className="rounded-2xl border border-[#e7e8ef] bg-[#fafafd] p-3">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#dedcff] text-sm font-bold text-[#514ae2]">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-[#2d364d]">{user.name}</p>
              <p className="truncate text-[11px] text-[#8a92a5]">{user.email}</p>
            </div>
            <button onClick={logout} disabled={loggingOut} className="grid size-8 place-items-center rounded-lg text-[#8a92a5] hover:bg-white hover:text-[#c33d3d]" aria-label="退出登录">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-[#e7e8ef] bg-white lg:block">
        <Navigation user={user} />
      </aside>

      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e7e8ef] bg-white/90 px-4 backdrop-blur lg:hidden">
        <Logo />
        <button className="grid size-10 place-items-center rounded-xl border border-[#e4e5ec]" onClick={() => setMobileOpen(true)} aria-label="打开导航">
          <Menu size={20} />
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-[#172036]/35 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="关闭导航遮罩" />
          <aside className="absolute inset-y-0 left-0 w-[286px] bg-white shadow-2xl">
            <button className="absolute right-3 top-5 z-10 grid size-9 place-items-center rounded-lg text-[#6e778b] hover:bg-[#f0f1f5]" onClick={() => setMobileOpen(false)} aria-label="关闭导航">
              <X size={19} />
            </button>
            <Navigation user={user} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className="min-h-screen lg:pl-[248px]">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8 xl:px-10">{children}</div>
      </main>
    </div>
  );
}

export function HeaderUser({ user }: { user: AuthUser }) {
  return (
    <div className="hidden items-center gap-2 text-sm text-[#667085] sm:flex">
      <span className="grid size-8 place-items-center rounded-xl bg-[#efefff] font-bold text-[#5a54d8]">{user.name[0]}</span>
      <span className="font-semibold text-[#374057]">{user.name}</span>
      <ChevronDown size={14} />
    </div>
  );
}
