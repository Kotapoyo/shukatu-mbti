"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { loadDemoCompanies, loadDemoSavedCompanies } from "@/lib/demo-data";
import styles from "./page.module.css";

type SavedCompany = { id: string; name: string };
type ListState =
  | { status: "loading" }
  | { status: "unauthorized" }
  | { status: "error" }
  | { status: "ready"; userId: string; companies: SavedCompany[] };

export default function SavedCompaniesList() {
  const { data: session, isPending, error: sessionError } = authClient.useSession();
  const userId = session?.user.id;
  const [state, setState] = useState<ListState>({ status: "loading" });

  useEffect(() => {
    if (isPending) return;
    if (sessionError) {
      setState({ status: "error" });
      return;
    }
    if (!userId) {
      setState({ status: "unauthorized" });
      return;
    }
    const activeUserId = userId;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/saved-companies", { signal: controller.signal, cache: "no-store" });
        if (response.status === 401) {
          setState({ status: "unauthorized" });
          return;
        }
        if (!response.ok) throw new Error("保存企業を取得できませんでした。");
        const data: { companies: SavedCompany[] } = await response.json();
        const demoCompanies = loadDemoCompanies(window.localStorage, activeUserId);
        const demoSaved = loadDemoSavedCompanies(window.localStorage, activeUserId).map((saved) => {
          const current = demoCompanies.find((company) => company.id === saved.id);
          if (!current) throw new Error(`保存したデモ企業が見つかりません: ${saved.id}`);
          return { id: current.id, name: current.name };
        });
        setState({ status: "ready", userId: activeUserId, companies: [...demoSaved, ...data.companies] });
      } catch {
        if (!controller.signal.aborted) setState({ status: "error" });
      }
    }
    void load();
    return () => controller.abort();
  }, [isPending, sessionError, userId]);

  if (isPending || (state.status === "ready" && state.userId !== userId) || state.status === "loading") return <p className={styles.status}>保存した企業を読み込んでいます。</p>;
  if (state.status === "error") return <p className={styles.status} role="alert">保存した企業を読み込めませんでした。</p>;
  if (state.status === "unauthorized") {
    return <div className={styles.status}><p>保存した企業を見るにはログインしてください。</p><Link href="/login">ログインする</Link></div>;
  }
  if (state.companies.length > 0) {
    return (
      <section aria-label="保存した企業">
        <ul className={styles.companyList}>
          {state.companies.map((company) => (
            <li className={styles.companyCard} key={company.id}>
              <span className={styles.companyMark} aria-hidden="true">★</span>
              <div><h2>{company.name}</h2><p>架空企業・保存済み</p></div>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  return (
    <section className={styles.emptyState} aria-labelledby="empty-title">
      <div className={styles.illustration}>
        <span className={styles.star} aria-hidden="true">★</span>
        <Image src="/images/companies.svg" width={112} height={112} alt="" unoptimized />
      </div>
      <h2 id="empty-title">保存した企業はまだありません</h2>
      <p>診断後の提案結果から企業を保存すると、ここで確認できます。</p>
    </section>
  );
}
