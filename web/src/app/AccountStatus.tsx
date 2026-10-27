"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import styles from "./page.module.css";

export default function AccountStatus() {
  const router = useRouter();
  const { data: session, isPending, error: sessionError } = authClient.useSession();
  const [error, setError] = useState("");

  if (isPending) return null;
  if (sessionError) return <p className={styles.accountStatus} role="alert">ログイン状態を確認できませんでした。MySQLへの接続を確認してください。</p>;
  if (!session) return <Link className={styles.accountLink} href="/login">ログイン・新規登録</Link>;

  return (
    <div className={styles.accountStatus}>
      <span>デモ学生としてログイン中</span>
      <button type="button" onClick={async () => {
        setError("");
        try {
          const result = await authClient.signOut();
          if (result.error) {
            setError("ログアウトできませんでした。");
            return;
          }
          router.refresh();
        } catch {
          setError("サーバーに接続できませんでした。");
        }
      }}>ログアウト</button>
      {error && <span role="alert">{error}</span>}
    </div>
  );
}
