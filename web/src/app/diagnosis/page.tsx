"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { answerValues, questions, type Answer } from "./questions";
import { ANSWERS_STORAGE_KEY } from "./recommendations";
import styles from "./page.module.css";

export default function DiagnosisPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [review, setReview] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const answeredCount = Object.keys(answers).length;
  const canContinue = questions.every((question) => answers[question.id] !== undefined);

  function moveTo(nextReview: boolean) {
    setReview(nextReview);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function showRecommendations() {
    if (!canContinue) return;
    try {
      window.sessionStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(answers));
    } catch {
      setSaveError(true);
      return;
    }
    router.push("/diagnosis/results");
  }

  return (
    <main className={styles.screen}>
      <header className={styles.header}>
        <Link href="/" className={styles.brand} aria-label="企業MBTI ホームへ">
          企業MBTI
          <Image src="/images/character-flower.svg" alt="" width={42} height={40} unoptimized />
        </Link>
        <h1 className={styles.heading} ref={heading} tabIndex={-1}>
          {review ? "回答内容の確認" : "働き方の相性診断"}
        </h1>
      </header>

      <div className={styles.progressRow}>
        <progress className={styles.progress} value={answeredCount} max={questions.length} aria-label="回答済みの質問数" />
        <p className={styles.count} aria-live="polite"><strong>{String(answeredCount).padStart(2, "0")}</strong> / {String(questions.length).padStart(2, "0")}</p>
      </div>
      <p className={styles.introduction}>あなたの希望に近い丸を、1つずつ選んでください。</p>

      {review ? (
        <section aria-label={`${questions.length}問の回答内容`} className={styles.review}>
          <p className={styles.notice}>{questions.length}問すべてに回答しました。内容を確認してください。</p>
          <dl>
            {questions.map((question, index) => (
              <div className={styles.reviewItem} key={question.id}>
                <dt>Q{index + 1}. {question.title}</dt>
                <dd>{answers[question.id] ? question.choices[answers[question.id] - 1] : "未回答"}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.notice}>架空企業と、このブラウザーで登録したデモ企業を使って相性を比べます。保存済みプロフィールがある場合は、希望勤務地と最低月給も判定します。</p>
          {saveError && <p className={styles.notice} role="alert">回答を一時保存できませんでした。ブラウザーの設定を確認してから再度お試しください。</p>}
          <div className={styles.actions}>
            <button type="button" className={styles.back} onClick={() => moveTo(false)}>回答を見直す</button>
            <button type="button" className={styles.next} onClick={showRecommendations}>企業を提案する<span aria-hidden="true">›</span></button>
          </div>
        </section>
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); if (canContinue) moveTo(true); }}>
          <div className={styles.questions}>
            {questions.map((question, index) => (
              <fieldset key={question.id} className={styles.question}>
                <legend className={styles.questionTitle}>Q{index + 1}. {question.title}</legend>
                {question.id === "commute" && (
                  <p className={styles.location}>通勤距離の希望は、現在の提案判定には使いません。</p>
                )}
                <div className={styles.scale}>
                  {answerValues.map((value) => (
                    <label key={value} className={styles.option} data-value={value}>
                      <input type="radio" name={question.id} value={value} checked={answers[question.id] === value} onChange={() => setAnswers((previous) => ({ ...previous, [question.id]: value }))} aria-label={`${value}：${question.choices[value - 1]}`} required />
                      <span className={styles.circle} aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m5 12 4.5 4.5L19 7" /></svg></span>
                      <span className={styles.value} aria-hidden="true">{value}</span>
                    </label>
                  ))}
                </div>
                <div className={styles.endpoints} aria-hidden="true"><span>{question.lowLabel}</span><span>{question.highLabel}</span></div>
                <p className={styles.selected} aria-live="polite">{answers[question.id] ? question.choices[answers[question.id] - 1] : "未回答"}</p>
              </fieldset>
            ))}
          </div>
          {!canContinue && <p className={styles.pageHint}>すべての質問に回答すると進めます</p>}
          <div className={styles.actions}>
            <Link className={styles.back} href="/">戻る</Link>
            <button className={styles.next} type="submit" disabled={!canContinue}>回答を確認する<span aria-hidden="true">›</span></button>
          </div>
        </form>
      )}

      <nav className={styles.navigation} aria-label="学生メニュー">
        <Link href="/"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></svg>ホーム</Link>
        <Link href="/profile"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4" /><path d="M4 22v-2a8 8 0 0 1 16 0v2" /></svg>プロフィール</Link>
      </nav>
    </main>
  );
}
