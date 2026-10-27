"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { loadDemoCompanies, loadDemoProfile, type DemoCompany, type DemoProfile } from "@/lib/demo-data";
import {
  ANSWERS_STORAGE_KEY,
  dummyCompanies,
  isDiagnosisAnswers,
  recommendCompanies,
  type DiagnosisAnswers,
} from "../recommendations";
import ResultsView from "./ResultsView";
import styles from "./page.module.css";

type AnswerState =
  | { status: "loading" | "missing" | "invalid" }
  | { status: "ready"; answers: DiagnosisAnswers };

type DemoState =
  | { status: "loading" | "error" }
  | { status: "ready"; userId: string | null; companies: DemoCompany[]; profile: DemoProfile | null };

export default function RecommendationResults() {
  const { data: session, isPending, error: sessionError } = authClient.useSession();
  const userId = session?.user.id ?? null;
  const [answerState, setAnswerState] = useState<AnswerState>({ status: "loading" });
  const [demoState, setDemoState] = useState<DemoState>({ status: "loading" });

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(ANSWERS_STORAGE_KEY);
      if (stored === null) {
        setAnswerState({ status: "missing" });
        return;
      }
      const parsed: unknown = JSON.parse(stored);
      setAnswerState(isDiagnosisAnswers(parsed) ? { status: "ready", answers: parsed } : { status: "invalid" });
    } catch (error) {
      if (error instanceof SyntaxError || error instanceof DOMException) {
        setAnswerState({ status: "invalid" });
        return;
      }
      throw error;
    }
  }, []);

  useEffect(() => {
    if (isPending || sessionError) return;
    try {
      setDemoState({
        status: "ready",
        userId,
        companies: userId ? loadDemoCompanies(window.localStorage, userId) : [],
        profile: userId ? loadDemoProfile(window.localStorage, userId) : null,
      });
    } catch {
      setDemoState({ status: "error" });
    }
  }, [isPending, userId, sessionError]);

  if (answerState.status === "ready") {
    if (sessionError || demoState.status === "error") return <main className={styles.screen}><p role="alert">デモデータを読み込めませんでした。ログイン状態とブラウザーの保存データを確認してください。</p></main>;
    if (isPending || demoState.status !== "ready" || demoState.userId !== userId) return <main className={styles.screen} aria-busy="true"><p>提案結果を読み込んでいます。</p></main>;
    return <ResultsView
      key={userId ?? "guest"}
      companies={recommendCompanies(answerState.answers, [...dummyCompanies, ...demoState.companies], demoState.profile)}
      answers={answerState.answers}
      userId={userId}
      demoCompanies={demoState.companies}
      profile={demoState.profile}
    />;
  }

  if (answerState.status === "loading") {
    return <main className={styles.screen} aria-busy="true"><p>提案結果を読み込んでいます。</p></main>;
  }

  return (
    <main className={styles.screen}>
      <section className={styles.emptyState} aria-labelledby="results-heading">
        <h1 id="results-heading" className={styles.emptyHeading}>
          {answerState.status === "missing" ? "診断回答がまだありません" : "診断回答を読み込めませんでした"}
        </h1>
        <div className={styles.emptyCard}>
          <p className={styles.emptyMessage}>12問に回答すると、架空の企業から相性が近い候補を表示できます。</p>
          <Link className={styles.emptyHome} href="/diagnosis">診断を始める<span className={styles.chevron} aria-hidden="true" /></Link>
        </div>
      </section>
    </main>
  );
}
