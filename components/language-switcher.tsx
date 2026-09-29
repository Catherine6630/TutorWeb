"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage, isPending } = useLanguage();
  const label = language === "zh" ? "切换语言" : "Change language";

  return (
    <div
      className={cn("inline-flex items-center gap-1 rounded-xl border border-[#e1e3eb] bg-white p-1 text-xs font-bold shadow-sm", className)}
      aria-label={label}
    >
      <Languages size={14} className="ml-1.5 text-[#7b8497]" aria-hidden="true" />
      {(["en", "zh"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLanguage(option)}
          disabled={isPending}
          aria-pressed={language === option}
          className={cn(
            "rounded-lg px-2.5 py-1.5 transition disabled:cursor-wait",
            language === option ? "bg-[#625bf6] text-white" : "text-[#6f788c] hover:bg-[#f3f3f8]",
          )}
        >
          {option === "en" ? "EN" : "中文"}
        </button>
      ))}
    </div>
  );
}
