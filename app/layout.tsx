import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 班务与日程管家",
  description: "面向班长场景的任务解析、看板管理与 AI 重排应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
