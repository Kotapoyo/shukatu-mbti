import Link from "next/link";
import styles from "./page.module.css";

function EmptyIllustration() {
  return (
    <svg viewBox="0 0 420 240" fill="none" role="img" aria-label="笑顔のお花のイラスト">
      <ellipse cx="113" cy="111" rx="76" ry="59" fill="var(--color-mint)" opacity=".17" />
      <ellipse cx="321" cy="154" rx="64" ry="47" fill="var(--color-purple)" opacity=".18" />
      <ellipse cx="220" cy="223" rx="83" ry="11" fill="var(--color-yellow)" opacity=".12" />
      <path d="M222 226v-65" stroke="var(--color-mint)" strokeWidth="7" strokeLinecap="round" />
      <path d="M219 221c-28 3-49-15-50-33 25-6 49 12 50 33Zm8 0c1-27 23-40 45-31-1 21-20 36-45 31Z" fill="var(--color-mint)" />
      <path d="M188 60c-2-42 63-49 67-8 32-21 69 22 39 48 42 12 29 68-11 64-2 42-59 48-72 11-29 32-78 3-60-32-43-10-43-64-3-74 1-28 25-31 40-9Z" fill="var(--color-coral)" />
      <circle cx="221" cy="117" r="43" fill="var(--color-cream)" />
      <ellipse cx="207" cy="110" rx="4" ry="6" fill="var(--color-ink)" /><ellipse cx="234" cy="110" rx="4" ry="6" fill="var(--color-ink)" />
      <path d="M215 123q8 10 15-1" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="194" cy="127" r="7" fill="var(--color-coral)" opacity=".35" /><circle cx="247" cy="127" r="7" fill="var(--color-coral)" opacity=".35" />
      <path d="m287 40 7-17m13 30 15-11" stroke="var(--color-mint)" strokeWidth="7" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}

export default function EmptyResults() {
  return (
    <section className={styles.emptyState} aria-labelledby="results-heading">
      <h1 id="results-heading" className={styles.emptyHeading}>今回は条件に合う企業が<br />見つかりませんでした</h1>
      <div className={styles.emptyArt}><EmptyIllustration /></div>
      <div className={styles.emptyCard}>
        <p className={styles.emptyMessage}>希望条件を見直して、<br />もう一度探してみましょう</p>
        <button className={styles.emptyPrimary} type="button" disabled aria-describedby="empty-profile-note">希望条件を見直す<span className={styles.chevron} aria-hidden="true" /></button>
        <Link className={styles.emptyHome} href="/">ホームへ戻る<span className={styles.chevron} aria-hidden="true" /></Link>
        <p className={styles.connectionNote} id="empty-profile-note">希望条件の変更は、プロフィール画面の準備ができ次第ご利用いただけます。</p>
      </div>
    </section>
  );
}
