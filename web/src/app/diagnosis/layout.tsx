import type { Metadata } from "next";

export const metadata: Metadata = {
  icons: { icon: "/images/character-flower.svg" },
};

export default function DiagnosisLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
