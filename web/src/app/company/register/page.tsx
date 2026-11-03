import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CompanyRegisterForm from "./CompanyRegisterForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "企業情報の登録 | 企業MBTI",
  icons: { icon: "/images/character-flower.svg" },
};

export default function CompanyRegisterPage() {
  return <main className={styles.page}><div className={styles.container}>
    <header className={styles.header}><Link className={styles.backLink} href="/" aria-label="ホームへ戻る"><span aria-hidden="true">←</span> ホームへ戻る</Link><span className={styles.brand}>企業<span>M</span><span>B</span><span>T</span><span>I</span></span></header>
    <div className={styles.intro}><div><p className={styles.eyebrow}>企業向け</p><h1>企業情報の登録</h1><p className={styles.lead}>募集条件と働き方の評価を入力して、提案結果を確認できます。</p></div><div className={styles.illustration} aria-hidden="true"><Image src="/images/companies.svg" alt="" width={112} height={112} unoptimized /></div></div>
    <CompanyRegisterForm />
  </div></main>;
}
