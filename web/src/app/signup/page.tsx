"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import styles from "./page.module.css";
import PasswordCharacter from "./PasswordCharacter";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [confirmationTouched, setConfirmationTouched] = useState(false);
  const showMatch = confirmationTouched && confirmation.length > 0;
  const passwordsMatch = password === confirmation;
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function validateEmail(input: HTMLInputElement) {
    setEmailError(input.validity.valueMissing ? "メールアドレスを入力してください。" : input.validity.typeMismatch ? "メールアドレスの形式を確認してください（例：student@example.com）。" : "");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!passwordsMatch) {
      setConfirmationTouched(true);
      setFormError("確認用パスワードが一致していません。");
      return;
    }
    const fields = new FormData(event.currentTarget);
    const email = String(fields.get("email")).trim().toLowerCase();
    if (!email.endsWith("@example.com")) {
      setFormError("開発中は @example.com の架空メールアドレスだけ登録できます。");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await authClient.signUp.email({ name: "デモ学生", email, password });
      if (error) {
        setFormError(error.status === 400 ? "入力内容を確認してください。架空メールと8文字以上のパスワードが必要です。" : "登録できませんでした。接続と入力内容を確認してください。");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setFormError("サーバーに接続できませんでした。時間をおいて再試行してください。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="landing mx-auto">
      <header className="brand flex items-center justify-center" aria-label="企業MBTI">
        <span className="brand-rays" aria-hidden="true"><i /><i /><i /></span>
        <span className="brand-company">企業</span>
        <span className="brand-letters"><b>M</b><b>B</b><b>T</b><b>I</b></span>
        <span className="brand-rays brand-rays-right" aria-hidden="true"><i /><i /><i /></span>
      </header>

      <section className={styles.content} aria-labelledby="signup-title">
        <div className="text-center">
          <Image
            className={styles.character}
            src="/images/clipboard.svg"
            width={160}
            height={160}
            alt=""
            priority
            unoptimized
          />
          <p className={styles.welcomeLabel}>はじめての方へ</p>
          <h1 id="signup-title">学生の新規登録</h1>
          <p className="hero-description">アカウントを作成して、<br />あなたに合う企業探しを始めよう。</p>
        </div>

        <form className={styles.form} method="post" onSubmit={handleSubmit} aria-describedby="signup-note">
          <div className={styles.field}>
            <label className="font-bold" htmlFor="email">メールアドレス</label>
            <input
              className={styles.input}
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="例：student@example.com"
              aria-invalid={Boolean(emailError)}
              aria-describedby="email-feedback"
              onBlur={(event) => { setEmailTouched(true); validateEmail(event.currentTarget); }}
              onChange={(event) => { if (emailTouched) validateEmail(event.currentTarget); }}
              required
            />
            <p id="email-feedback" className={styles.feedback} role="status">{emailError}</p>
          </div>

          <div className={styles.field}>
            <label className="font-bold" htmlFor="password">パスワード</label>
            <div className={styles.passwordRow}>
              <input
                className={styles.input}
                id="password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
              />
              <button
                className={styles.visibilityButton}
                type="button"
                aria-label="パスワードを表示"
                aria-pressed={showPassword}
                aria-controls="password"
                onClick={() => setShowPassword((visible) => !visible)}
              >
                <PasswordCharacter className={styles.toggleCharacter} visible={showPassword} />
                <span>{showPassword ? "非表示" : "表示"}</span>
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className="font-bold" htmlFor="password-confirmation">パスワード（確認）</label>
            <div className={styles.passwordRow}>
              <input
                className={styles.input}
                id="password-confirmation"
                value={confirmation}
                onChange={(event) => setConfirmation(event.currentTarget.value)}
                onBlur={() => setConfirmationTouched(true)}
                aria-invalid={showMatch && !passwordsMatch}
                type={showConfirmation ? "text" : "password"}
                autoComplete="new-password"
                aria-describedby="confirmation-hint confirmation-feedback"
                required
              />
              <button
                className={styles.visibilityButton}
                type="button"
                aria-label="確認用パスワードを表示"
                aria-pressed={showConfirmation}
                aria-controls="password-confirmation"
                onClick={() => setShowConfirmation((visible) => !visible)}
              >
                <PasswordCharacter className={styles.toggleCharacter} visible={showConfirmation} />
                <span>{showConfirmation ? "非表示" : "表示"}</span>
              </button>
            </div>
            <p id="confirmation-hint" className="availability-note">同じパスワードをもう一度入力してください。</p>
            <p id="confirmation-feedback" className={styles.feedback} role="status">
              {showMatch ? (passwordsMatch ? "✓ パスワードが一致しています。" : "パスワードが一致していません。") : ""}
            </p>
          </div>

          <div className="text-center">
            <button className={`start-button w-full ${styles.signupButton}`} type="submit" disabled={submitting} aria-describedby="signup-note">
              {submitting ? "登録中…" : "アカウントを作成"}
            </button>
            <p id="signup-note" className="availability-note">開発中は @example.com の架空メールアドレスだけ登録できます。実在の個人情報は入力しないでください。</p>
            {formError && <p className={styles.feedback} role="alert">{formError}</p>}
          </div>
        </form>

        <div className={styles.login}>
          <p className="font-bold">すでにアカウントをお持ちの方</p>
          <Link className={styles.loginLink} href="/login">ログイン画面へ</Link>
        </div>
      </section>
    </main>
  );
}
