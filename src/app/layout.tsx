import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "企業MBTI | あなたに合う企業を、見つけよう。",
  description: "希望条件と働き方の相性から、企業選びをもっと手軽に。",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#fff8ee" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}

