"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";
import welcomeImage from "./welcome.png";
import PasswordCharacter from "./PasswordCharacter";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailError, setEmailError] = useState("");

  function validateEmail(input: HTMLInputElement) {
    setEmailError(input.validity.valueMissing ? "メールアドレスを入力してください。" : input.validity.typeMismatch ? "メールアドレスの形式を確認してください（例：student@example.com）。" : "");
  }

  return (
    <main className="landing mx-auto">
      <header className="brand flex items-center justify-center" aria-label="企業MBTI">
        <span className="brand-rays" aria-hidden="true"><i /><i /><i /></span>
        <span className="brand-company">企業</span>
        <span className="brand-letters"><b>M</b><b>B</b><b>T</b><b>I</b></span>
        <span className="brand-rays brand-rays-right" aria-hidden="true"><i /><i /><i /></span>
      </header>

      <section className={styles.content} aria-labelledby="login-title">
        <div className="text-center">
          <Image
            className={styles.character}
            src={welcomeImage}
            sizes="(max-width: 320px) 100vw, 256px"
            alt=""
            priority
          />
          <h1 id="login-title">ログイン</h1>
          <p className="hero-description">あなたに合う企業探しを、ここから。</p>
        </div>

        {/* 認証APIの仕様確定後に接続する。入力内容の送信・保存は行わない。 */}
        <form className={styles.form} onSubmit={(event) => event.preventDefault()} aria-describedby="login-note">
          <div className={styles.field}>
            <label className="font-bold" htmlFor="email">メールアドレス</label>
            <input
              className={styles.input}
              id="email"
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
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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

          <div className="text-center">
            <button className="start-button w-full" type="submit" disabled aria-describedby="login-note">
              ログイン
            </button>
            <p id="login-note" className="availability-note">ログイン機能は準備中です。</p>
          </div>
        </form>

        <div className={styles.registration}>
          <p className="font-bold">はじめてご利用の学生の方へ</p>
          <Link className={`start-button flex w-full items-center justify-center ${styles.signupLink}`} href="/signup">
            学生の新規登録
          </Link>
        </div>
        <Link className={styles.homeLink} href="/">ホームへ戻る</Link>
      </section>
    </main>
  );
}
