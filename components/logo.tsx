import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2.5 font-bold tracking-[-0.035em]", className)}>
      <span className="grid size-9 place-items-center rounded-xl bg-[#625bf6] text-white shadow-[0_8px_20px_rgba(98,91,246,0.24)]">
        <Sparkles size={18} strokeWidth={2.5} />
      </span>
      {!compact && <span className="text-[1.18rem]">{process.env.NEXT_PUBLIC_APP_NAME || "Tutorly"}</span>}
    </Link>
  );
}
