import type { Metadata } from "next";
import { LanguageProvider } from "@/components/language-provider";
import { getLanguage } from "@/lib/language-server";
import "./globals.css";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Tutorly";

export const metadata: Metadata = {
  title: {
    default: `${appName} — AI study partner for CS`,
    template: `%s · ${appName}`,
  },
  description: "A source-grounded AI learning workspace built for computer-science students.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const language = await getLanguage();
  return (
    <html lang={language === "zh" ? "zh-CN" : "en"}>
      <body><LanguageProvider initialLanguage={language}>{children}</LanguageProvider></body>
    </html>
  );
}
