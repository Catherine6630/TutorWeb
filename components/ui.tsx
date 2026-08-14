import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes } from "react";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
}) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-[#625bf6] text-white shadow-[0_8px_20px_rgba(98,91,246,.2)] hover:bg-[#514ae2]",
        variant === "secondary" && "border border-[#dedfe8] bg-white text-[#2f3850] hover:border-[#c9c8ef] hover:bg-[#fafaff]",
        variant === "ghost" && "text-[#5c667d] hover:bg-[#f0f1f6] hover:text-[#252e47]",
        variant === "danger" && "bg-[#fff0f0] text-[#c53e3e] hover:bg-[#ffe3e3]",
        size === "sm" && "h-9 px-3.5 text-sm",
        size === "md" && "h-11 px-4.5 text-sm",
        size === "lg" && "h-12 px-5.5 text-[0.95rem]",
        size === "icon" && "size-10",
        className,
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-[#dfe2ea] bg-white px-3.5 text-[0.93rem] text-[#202941] shadow-sm outline-none placeholder:text-[#a0a7b5] focus:border-[#817bf7] focus:ring-4 focus:ring-[#625bf6]/10",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-[#e1e3eb] bg-[#f7f8fb] px-2.5 py-1 text-xs font-semibold text-[#667085]",
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#625bf6]">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-[-0.035em] text-[#172036] sm:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[#727b90]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
