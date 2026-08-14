import type { Metadata } from "next";
import "./globals.css";

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Tutorly";

export const metadata: Metadata = {
  title: {
    default: `${appName} — AI study partner for CS`,
    template: `%s · ${appName}`,
  },
  description: "A source-grounded AI learning workspace built for computer-science students.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
