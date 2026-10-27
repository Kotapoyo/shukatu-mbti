"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { loadDemoSavedCompanies, saveDemoSavedCompany, type DemoCompany, type DemoProfile } from "@/lib/demo-data";
import CompanyIllustration from "./CompanyIllustration";
import EmptyResults from "./EmptyResults";
import type { DiagnosisAnswers, Recommendation } from "../recommendations";
import styles from "./page.module.css";

export default function ResultsView({ companies, answers, userId, demoCompanies, profile }: {
  companies: readonly Recommendation[];
  answers: DiagnosisAnswers;
  userId: string | null;
  demoCompanies: readonly DemoCompany[];
  profile: DemoProfile | null;
}) {
  const hasCompanies = companies.length > 0;
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [saveState, setSaveState] = useState<"loading" | "ready" | "unauthorized" | "error">("loading");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadSaved() {
      try {
        const response = await fetch("/api/saved-companies", { signal: controller.signal, cache: "no-store" });
        if (response.status === 401) {
          setSaveState("unauthorized");
          return;
        }
        if (!response.ok) throw new Error("保存状態の取得に失敗しました。");
        const data: { companies: { id: string }[] } = await response.json();
        const demoSaved = userId ? loadDemoSavedCompanies(window.localStorage, userId) : [];
        setSavedIds(new Set([...data.companies, ...demoSaved].map((company) => company.id)));
        setSaveState("ready");
      } catch (error) {
        if (controller.signal.aborted) return;
        setSaveState("error");
      }
    }
    void loadSaved();
    return () => controller.abort();
  }, [userId]);

  async function saveCompany(companyId: string) {
    setSavingId(companyId);
    setSaveError("");
    try {
      const demoCompany = demoCompanies.find((company) => company.id === companyId);
      if (demoCompany) {
        if (!userId) {
          setSaveState("unauthorized");
          return;
        }
        saveDemoSavedCompany(window.localStorage, userId, { id: demoCompany.id, name: demoCompany.name });
        setSavedIds((current) => new Set(current).add(companyId));
        return;
      }
      const response = await fetch("/api/saved-companies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ companyId, answers, conditions: profile ? { workLocation: profile.workLocation, minimumMonthlySalaryYen: profile.minimumMonthlySalaryYen } : null }),
      });
      if (response.status === 401) {
        setSaveState("unauthorized");
        return;
      }
      if (!response.ok) throw new Error("保存に失敗しました。");
      setSavedIds((current) => new Set(current).add(companyId));
    } catch {
      setSaveError("企業を保存できませんでした。時間をおいて再試行してください。");
    } finally {
      setSavingId(null);
    }
  }

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
          <p>回答の傾向が近い<strong>{companies.length}社</strong>をご提案</p>
        </div>
      </section>

        <section className={styles.companyList} aria-label="提案企業">
          {companies.map((company, index) => (
            <article className={styles.company} key={company.id} data-tone={index % 2 === 0 ? "mint" : "purple"} aria-labelledby={`company-${company.id}`}>
              <div className={styles.companyArt}><CompanyIllustration letter={String.fromCharCode(65 + index)} /></div>
              <div className={styles.companyContent}>
                <h2 id={`company-${company.id}`} className={styles.companyName}>{company.name}</h2>
                <p className={styles.score}>評価の差の合計：{company.difference}点（小さいほど近い）</p>
                <ul className={styles.reasons} aria-label="提案理由">
                  {company.reasons.map((reason) => (
                    <li key={reason}><span className={styles.check} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-9" /></svg></span><span>{reason}</span></li>
                  ))}
                </ul>
                {saveState === "unauthorized" ? (
                  <Link className={styles.saveButton} href="/login">ログインして保存</Link>
                ) : (
                  <button
                    className={styles.saveButton}
                    type="button"
                    disabled={saveState !== "ready" || savingId !== null || savedIds.has(company.id)}
                    onClick={() => void saveCompany(company.id)}
                  >
                    {savedIds.has(company.id) ? "保存済み" : savingId === company.id ? "保存中…" : "この企業を保存"}
                  </button>
                )}
                <button className={styles.detailButton} type="button" disabled title="企業詳細画面は準備中です" aria-describedby="connection-note">企業詳細を見る<span className={styles.chevron} aria-hidden="true" /></button>
              </div>
            </article>
          ))}
        </section>

      <div className={styles.followUp}>
        {saveState === "error" && <p className={styles.saveError} role="alert">保存状態を読み込めませんでした。</p>}
        {saveError && <p className={styles.saveError} role="alert">{saveError}</p>}
        <Link className={styles.savedLink} href="/saved-companies">保存した企業を見る</Link>
        <p className={styles.dummyNote}>※ 架空企業と、このブラウザーで登録したデモ企業による提案です。{profile ? "希望勤務地と最低月給を判定しています。" : "プロフィール未登録のため、勤務地と月給は判定していません。"} 通勤距離の回答は点差に含めていません。</p>
        <Link className={styles.conditionsButton} href="/profile">希望条件を見直す</Link>
        <p className={styles.connectionNote} id="connection-note">企業詳細画面は準備中です。</p>
      </div>
      </> : <EmptyResults />}

      <footer className={styles.disclaimer}><span aria-hidden="true">i</span><p>診断は企業選びの参考です</p></footer>
      <nav className={styles.navigation} aria-label="学生メニュー">
        <Link href="/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></svg><span>ホーム</span></Link>
        <Link href="/profile"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M4 22v-2a8 8 0 0 1 16 0v2" /></svg><span>プロフィール</span></Link>
      </nav>
    </main>
  );
}
