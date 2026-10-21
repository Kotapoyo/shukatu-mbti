import Link from "next/link";
import styles from "./BottomNavigation.module.css";

type Props = {
  active: "home" | "profile" | "recommendations";
  profileEnabled?: boolean;
  recommendationsHref?: string;
};

export default function BottomNavigation({ active, profileEnabled = false, recommendationsHref }: Props) {
  return (
    <nav className={styles.bottomNav} aria-label="画面の切り替え">
      <Link className={`${styles.navItem} ${active === "home" ? styles.current : ""}`} href="/" aria-current={active === "home" ? "page" : undefined}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" />
          <path d="M9 21v-7h6v7" />
        </svg>
        <span>ホーム</span>
      </Link>
      {profileEnabled ? (
        <Link className={`${styles.navItem} ${active === "profile" ? styles.current : ""}`} href="/profile" aria-current={active === "profile" ? "page" : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          <span>プロフィール</span>
        </Link>
      ) : (
        <button className={styles.navItem} type="button" disabled aria-label="プロフィール（準備中）">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
          </svg>
          <span>プロフィール</span>
          <small>準備中</small>
        </button>
      )}
      {recommendationsHref ? (
        <Link className={`${styles.navItem} ${active === "recommendations" ? styles.current : ""}`} href={recommendationsHref} aria-current={active === "recommendations" ? "page" : undefined}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
          </svg>
          <span>提案企業</span>
        </Link>
      ) : (
        <button className={styles.navItem} type="button" disabled aria-label="提案企業（準備中）">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
          </svg>
          <span>提案企業</span>
          <small>準備中</small>
        </button>
      )}
    </nav>
  );
}
