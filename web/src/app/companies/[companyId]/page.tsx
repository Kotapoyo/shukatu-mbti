import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building, DetailIcon, IdeaCharacter } from "./Illustrations";
import { sampleCompanies } from "./sample-companies";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "企業詳細 | 企業MBTI" };

export default async function CompanyDetailPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  if (!Object.hasOwn(sampleCompanies, companyId)) notFound();
  const company = sampleCompanies[companyId];

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="企業MBTI ホームへ">企業MBTI</Link>
        <p className={styles.pageLabel}>企業詳細</p>
        <div className={styles.character}><IdeaCharacter /></div>
      </header>

      <article className={styles.report} aria-labelledby="company-name">
        <div className={styles.identity}>
          <div className={styles.building}><Building letter={company.letter} /></div>
          <div className={styles.identityText}>
            <h1 id="company-name" className={styles.companyName}>{company.name}</h1>
            <p className={styles.dummyNote}>企業情報はダミーです</p>
          </div>
        </div>

        <section className={styles.section} aria-labelledby="about-heading">
          <h2 id="about-heading" className={styles.sectionHeading}><span className={styles.number} aria-hidden="true">01</span>会社について</h2>
          <div className={styles.description}>{company.description}</div>
        </section>

        <section className={styles.section} data-tone="purple" aria-labelledby="reasons-heading">
          <h2 id="reasons-heading" className={styles.sectionHeading}><span className={styles.number} aria-hidden="true">02</span>あなたに合う理由</h2>
          <ul className={styles.reasons}>
            {company.reasons.map((reason, index) => <li key={reason}><DetailIcon kind={index === 0 ? "team" : "training"} /><span>{reason}</span></li>)}
          </ul>
          <p className={styles.exampleNote}>提案理由は表示例です</p>
        </section>

        <section className={styles.section} aria-labelledby="work-heading">
          <h2 id="work-heading" className={styles.sectionHeading}><span className={styles.number} aria-hidden="true">03</span>働き方</h2>
          <dl className={styles.infoPanel}>
            <div className={styles.infoRow}><dt><DetailIcon kind="team" />共同作業</dt><dd>{company.teamwork ?? "未確認"}</dd></div>
            <div className={styles.infoRow}><dt><DetailIcon kind="training" />研修</dt><dd>{company.training ?? "未確認"}</dd></div>
          </dl>
        </section>

        <section className={styles.section} data-tone="purple" aria-labelledby="info-heading">
          <h2 id="info-heading" className={styles.sectionHeading}><span className={styles.number} aria-hidden="true">04</span>企業情報・出典</h2>
          <dl className={styles.infoPanel}>
            <div className={styles.infoRow}><dt><DetailIcon kind="building" />勤務地</dt><dd>{company.location ?? "未確認"}</dd></div>
            <div className={styles.infoRow}><dt><DetailIcon kind="team" />従業員数</dt><dd>{company.employeeCount === null ? "未確認" : `${company.employeeCount.toLocaleString("ja-JP")}人`}</dd></div>
            <div className={styles.infoRow}><dt><DetailIcon kind="source" />情報の出典</dt><dd className={styles.source}>出典URL：{company.sourceUrl ?? "なし"}<br />確認日：{company.checkedOn ?? "なし"}</dd></div>
          </dl>
        </section>
      </article>

      <div className={styles.actions}>
        <p className={styles.application}>公式応募先：{company.applicationUrl ?? "未確認"}</p>
        <button className={styles.registerButton} type="button" disabled aria-describedby="registration-note">企業を登録する<span aria-hidden="true" className={styles.chevron} /></button>
        <p id="registration-note" className={styles.preparing}>企業登録機能は準備中です。</p>
      </div>

      <footer className={styles.disclaimer}>診断は企業選びの参考です</footer>
      <nav className={styles.navigation} aria-label="学生メニュー">
        <Link href="/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></svg>ホーム</Link>
        <button type="button" disabled title="プロフィール画面は準備中です"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M4 22v-2a8 8 0 0 1 16 0v2" /></svg>プロフィール<small>準備中</small></button>
      </nav>
    </main>
  );
}
