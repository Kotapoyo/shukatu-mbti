import Image from "next/image";
import Link from "next/link";
import CompanyIllustration from "./CompanyIllustration";
import EmptyResults from "./EmptyResults";
import styles from "./page.module.css";

// View data only. The shared API contract and matching logic are not defined here.
export type ProposedCompany = {
  id: string;
  name: string;
  reasons: readonly string[];
};

export default function ResultsView({ companies }: { companies: readonly ProposedCompany[] }) {
  const hasCompanies = companies.length > 0;

  return (
    <main className={`${styles.screen}${hasCompanies ? "" : ` ${styles.emptyScreen}`}`}>
      <header className={styles.header}>
        <Link className={styles.brand} href="/" aria-label="企業MBTI ホームへ">
          <Image src="/images/character-flower.svg" alt="" width={44} height={42} unoptimized />
          <span>企業MBTI</span>
        </Link>
        <p className={styles.pageLabel}>提案結果</p>
      </header>

      {hasCompanies ? <>
      <section className={styles.intro} aria-labelledby="results-heading">
        <div className={styles.headingWrap}>
          <span className={styles.rays} aria-hidden="true"><i /><i /></span>
          <h1 id="results-heading" className={styles.heading}>
            あなたに合う企業が<br />見つかりました
          </h1>
          <span className={`${styles.rays} ${styles.raysRight}`} aria-hidden="true"><i /><i /></span>
        </div>
        <div className={styles.summary}>
          <Image className={styles.flower} src="/images/character-flower.svg" alt="笑顔の赤いお花のキャラクター" width={100} height={95} unoptimized />
          <p>希望条件を満たす<strong>{companies.length}社</strong>をご提案</p>
        </div>
      </section>

        <section className={styles.companyList} aria-label="提案企業">
          {companies.map((company, index) => (
            <article className={styles.company} key={company.id} data-tone={index % 2 === 0 ? "mint" : "purple"} aria-labelledby={`company-${company.id}`}>
              <div className={styles.companyArt}><CompanyIllustration letter={String.fromCharCode(65 + index)} /></div>
              <div className={styles.companyContent}>
                <h2 id={`company-${company.id}`} className={styles.companyName}>{company.name}</h2>
                <ul className={styles.reasons} aria-label="提案理由">
                  {company.reasons.map((reason) => (
                    <li key={reason}><span className={styles.check} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-9" /></svg></span><span>{reason}</span></li>
                  ))}
                </ul>
                <button className={styles.detailButton} type="button" disabled title="企業詳細画面は準備中です" aria-describedby="connection-note">企業詳細を見る<span className={styles.chevron} aria-hidden="true" /></button>
              </div>
            </article>
          ))}
        </section>

      <div className={styles.followUp}>
        <p className={styles.dummyNote}>※ 企業情報はダミーです</p>
        <button className={styles.conditionsButton} type="button" disabled title="プロフィール画面の希望条件変更は準備中です" aria-describedby="connection-note">希望条件を見直す</button>
        <p className={styles.connectionNote} id="connection-note">企業詳細・希望条件の変更は準備中です。</p>
      </div>
      </> : <EmptyResults />}

      <footer className={styles.disclaimer}><span aria-hidden="true">i</span><p>診断は企業選びの参考です</p></footer>
      <nav className={styles.navigation} aria-label="学生メニュー">
        <Link href="/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></svg><span>ホーム</span></Link>
        <button type="button" disabled title="プロフィール画面は準備中です"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M4 22v-2a8 8 0 0 1 16 0v2" /></svg><span>プロフィール</span><small>準備中</small></button>
      </nav>
    </main>
  );
}
