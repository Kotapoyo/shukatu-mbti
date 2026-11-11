"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { companyDetailExamples, companyDetailFields, loadDemoCompanies, type DemoCompany } from "@/lib/demo-data";
import { dummyCompanies } from "@/app/diagnosis/recommendations";
import { sampleCompanies } from "./sample-companies";
import styles from "./page.module.css";

type Company = { name: string; location?: string | null; monthlySalaryYen?: number | null; description?: string | null; applicationUrl?: string | null; sourceUrl?: string | null; verifiedAt?: string | null } & Partial<Pick<DemoCompany, (typeof companyDetailFields)[number][0]>>;
type DetailState = { status: "loading" } | { status: "error" } | { status: "missing" } | { status: "ready"; company: Company; kind: "demo" | "dummy" | "preview"; checkedOn: string | null };

export default function CompanyDetails({ companyId }: { companyId: string }) {
  const { data: session, isPending, error: sessionError } = authClient.useSession();
  const userId = session?.user.id;
  const [state, setState] = useState<DetailState>({ status: "loading" });

  useEffect(() => {
    if (isPending) return;
    if (sessionError) { setState({ status: "error" }); return; }
    const sample = dummyCompanies.find((company) => company.id === companyId);
    if (sample) { setState({ status: "ready", company: sample, kind: "dummy", checkedOn: null }); return; }
    if (Object.hasOwn(sampleCompanies, companyId)) {
      const preview = sampleCompanies[companyId];
      setState({ status: "ready", company: preview, kind: "preview", checkedOn: preview.checkedOn });
      return;
    }
    if (!userId) { setState({ status: "missing" }); return; }
    try {
      const company = loadDemoCompanies(window.localStorage, userId).find((item) => item.id === companyId);
      setState(company ? { status: "ready", company, kind: "demo", checkedOn: null } : { status: "missing" });
    } catch { setState({ status: "error" }); }
  }, [companyId, isPending, userId, sessionError]);

  if (state.status === "loading") return <main className={styles.screen} aria-busy="true"><p>企業情報を読み込んでいます。</p></main>;
  if (state.status === "error") return <main className={styles.screen}><p role="alert">企業情報を読み込めませんでした。</p></main>;
  if (state.status === "missing") return <main className={styles.screen}><p>企業が見つかりませんでした。</p><Link href="/saved-companies">保存した企業へ戻る</Link></main>;

  const { company, kind, checkedOn } = state;
  const description = company.description ?? null;
  const applicationUrl = company.applicationUrl ?? null;
  const sourceUrl = company.sourceUrl ?? null;
  const declaredOn = kind === "demo" ? company.verifiedAt : null;
  const validApplicationUrl = applicationUrl && /^https?:\/\//i.test(applicationUrl) ? applicationUrl : null;
  return <main className={styles.screen}>
    <header className={styles.header}><Link className={styles.brand} href="/">企業MBTI</Link><p className={styles.pageLabel}>企業詳細</p></header>
    <article className={styles.report}>
      <div className={styles.identity}><div className={styles.identityText}><h1 className={styles.companyName}>{company.name}</h1></div></div>
      {description && <section className={styles.section}><h2 className={styles.sectionHeading}>会社について</h2><p className={styles.description}>{description}</p></section>}
      <section className={styles.section} aria-labelledby="work-heading"><h2 id="work-heading" className={styles.sectionHeading}>働き方・職場</h2><dl className={styles.infoPanel}>
        {companyDetailFields.map(([field, label]) => <div className={styles.infoRow} key={field}><dt>{label}</dt><dd>{(kind === "demo" ? company[field] : companyDetailExamples[field]) ?? "未確認"}</dd></div>)}
      </dl></section>
      <section className={styles.section} aria-labelledby="conditions-heading"><h2 id="conditions-heading" className={styles.sectionHeading}>募集条件</h2><dl className={styles.infoPanel}>
        <div className={styles.infoRow}><dt>勤務地</dt><dd>{company.location ?? "未確認"}</dd></div>
        <div className={styles.infoRow}><dt>月給</dt><dd>{company.monthlySalaryYen === null || company.monthlySalaryYen === undefined ? "未確認" : `${(company.monthlySalaryYen / 10_000).toLocaleString("ja-JP")}万円`}</dd></div>
      </dl></section>
      <section className={styles.section} aria-labelledby="source-heading"><h2 id="source-heading" className={styles.sectionHeading}>情報の出典</h2><dl className={styles.infoPanel}>
        <div className={styles.infoRow}><dt>出典URL</dt><dd>{sourceUrl ?? "なし"}</dd></div>
        <div className={styles.infoRow}><dt>確認日</dt><dd>{checkedOn ?? "なし"}</dd></div>
        {kind === "demo" && <div className={styles.infoRow}><dt>自己申告日</dt><dd>{declaredOn ?? "なし"}</dd></div>}
      </dl></section>
    </article>
    <div className={styles.actions}>{validApplicationUrl && <a className={styles.registerButton} href={validApplicationUrl} target="_blank" rel="noopener noreferrer">公式応募先を見る</a>}<Link href="/saved-companies">保存した企業へ戻る</Link></div>
  </main>;
}
