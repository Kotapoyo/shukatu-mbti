import type { Metadata } from "next";
import BottomNavigation from "@/components/BottomNavigation";
import SavedCompaniesList from "./SavedCompaniesList";
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

        <SavedCompaniesList />
      </div>
      <BottomNavigation active="recommendations" profileEnabled recommendationsHref="/saved-companies" />
    </main>
  );
}
