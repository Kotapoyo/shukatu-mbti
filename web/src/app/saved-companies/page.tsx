import type { Metadata } from "next";
import Image from "next/image";
import BottomNavigation from "@/components/BottomNavigation";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "提案企業 | 企業MBTI",
  icons: { icon: "/images/character-flower.svg" },
};

export default function SavedCompaniesPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>YOUR COMPANIES</p>
          <h1>提案企業</h1>
          <p className={styles.description}>診断で見つけた企業を保存して、あとから見返せます。</p>
        </header>

        <section className={styles.emptyState} aria-labelledby="empty-title">
          <div className={styles.illustration}>
            <span className={styles.star} aria-hidden="true">★</span>
            <Image src="/images/companies.svg" width={112} height={112} alt="" unoptimized />
          </div>
          <h2 id="empty-title">保存した企業はまだありません</h2>
          <p>診断後の提案結果や企業詳細から企業を保存すると、ここで確認できます。</p>
          <p className={styles.note}>診断・保存機能は準備中です。</p>
        </section>
      </div>
      <BottomNavigation active="recommendations" recommendationsHref="/saved-companies" />
    </main>
  );
}
