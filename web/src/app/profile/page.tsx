"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import { authClient } from "@/lib/auth-client";
import { loadDemoProfile, nullableFormText, prefectures, saveDemoProfile, schoolTypes, type DemoProfile } from "@/lib/demo-data";
import styles from "./page.module.css";

function ProfileForm({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<DemoProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      setProfile(loadDemoProfile(window.localStorage, userId));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [userId]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: DemoProfile = {
      graduationYear: Number(form.get("graduationYear")),
      schoolType: String(form.get("schoolType") ?? ""),
      age: form.get("age") ? Number(form.get("age")) : null,
      schoolName: String(form.get("schoolName") ?? "").trim(),
      major: nullableFormText(form.get("major")),
      workLocation: String(form.get("workLocation") ?? ""),
      minimumMonthlySalaryYen: form.get("minimumMonthlySalaryYen") ? Number(form.get("minimumMonthlySalaryYen")) : null,
      gender: nullableFormText(form.get("gender")),
      hobbies: nullableFormText(form.get("hobbies")),
    };
    try {
      saveDemoProfile(window.localStorage, userId, next);
      setMessage("保存しました。診断結果を開くと、新しい条件で再判定します。");
    } catch {
      setMessage("保存できませんでした。入力内容とブラウザーの保存設定を確認してください。");
    }
  }

  if (status === "loading") return <p className={styles.notice}>プロフィールを読み込んでいます。</p>;
  if (status === "error") return <p className={styles.notice} role="alert">保存済みプロフィールを読み込めませんでした。ブラウザーのデモデータを確認してください。</p>;

  return (
    <form className={styles.form} onSubmit={submit} key={`${userId}:${profile?.workLocation ?? "new"}`}>
      <h2 className={styles.sectionTitle} id="profile-form-title">基本情報と希望条件</h2>
      <fieldset className={styles.fields}>
        <div className={`${styles.field} ${styles.fullWidth}`}><label htmlFor="graduation-year">卒業予定年<span className={styles.required}>必須</span></label><select className={styles.select} id="graduation-year" name="graduationYear" defaultValue={profile?.graduationYear ?? ""} required><option value="" disabled>卒業予定年を選択</option>{Array.from({ length: 8 }, (_, index) => new Date().getFullYear() + index).map((year) => <option key={year} value={year}>{year}年</option>)}</select></div>
        <div className={styles.field}><label htmlFor="school-type">学校種別<span className={styles.required}>必須</span></label><select className={styles.select} id="school-type" name="schoolType" defaultValue={profile?.schoolType ?? ""} required><option value="" disabled>学校種別を選択</option>{schoolTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></div>
        <div className={styles.field}><label htmlFor="age">年齢</label><input className={styles.input} id="age" name="age" type="number" min="15" max="100" defaultValue={profile?.age ?? ""} placeholder="例：21" /></div>
        <div className={`${styles.field} ${styles.fullWidth}`}><label htmlFor="school-name">学校名<span className={styles.required}>必須</span></label><input className={styles.input} id="school-name" name="schoolName" type="text" maxLength={120} required defaultValue={profile?.schoolName ?? ""} placeholder="例：企業MBTI大学" /></div>
        <div className={`${styles.field} ${styles.fullWidth}`}><label htmlFor="major">専攻・学んでいる分野</label><input className={styles.input} id="major" name="major" type="text" maxLength={120} defaultValue={profile?.major ?? ""} placeholder="例：情報工学" /></div>
        <div className={styles.field}><label htmlFor="work-location">希望勤務地<span className={styles.required}>必須</span></label><select className={styles.select} id="work-location" name="workLocation" defaultValue={profile?.workLocation ?? ""} required><option value="" disabled>都道府県を選択</option>{prefectures.map((place) => <option key={place} value={place}>{place}</option>)}</select></div>
        <div className={styles.field}><label htmlFor="minimum-salary">希望する最低月給（円）</label><input className={styles.input} id="minimum-salary" name="minimumMonthlySalaryYen" type="number" min="0" max="10000000" step="1000" defaultValue={profile?.minimumMonthlySalaryYen ?? ""} placeholder="例：250000" /></div>
        <div className={styles.field}><label htmlFor="gender">性別</label><select className={styles.select} id="gender" name="gender" defaultValue={profile?.gender ?? ""}><option value="">回答しない</option><option value="女性">女性</option><option value="男性">男性</option><option value="その他">その他</option></select></div>
        <div className={`${styles.field} ${styles.fullWidth}`}><label htmlFor="hobbies">趣味</label><textarea className={styles.textarea} id="hobbies" name="hobbies" maxLength={1000} defaultValue={profile?.hobbies ?? ""} placeholder="好きなこと、休日の過ごし方など" /></div>
      </fieldset>
      <p className={styles.notice}>架空の情報を入力してください。デモ用データとして、このブラウザーに保存します。希望勤務地と最低月給を企業候補の判定に使います。</p>
      <button className={styles.submit} type="submit">プロフィールを保存する</button>
      {message && <p className={styles.notice} role="status">{message}</p>}
      {message.startsWith("保存しました") && <Link href="/diagnosis/results">同じ診断回答で再判定する</Link>}
    </form>
  );
}

export default function ProfilePage() {
  const { data: session, isPending, error } = authClient.useSession();
  return <main className={styles.page}><div className={styles.container}>
    <header className={styles.header}><Link className={styles.backLink} href="/">ホームへ戻る</Link><div className={styles.brand} aria-label="企業MBTI"><span>企</span><span>業</span><span>M</span><span>B</span><span>T</span><span>I</span></div></header>
    <section className={styles.intro} aria-labelledby="profile-title"><p className={styles.eyebrow}>YOUR PROFILE</p><h1 className={styles.title} id="profile-title">あなたのことを<br />教えてください。</h1><p className={styles.description}>希望条件を登録すると、企業の募集条件と照合できます。</p></section>
    <section className={styles.formCard} aria-labelledby="profile-form-title">{isPending ? <p>ログイン状態を確認しています。</p> : error ? <p role="alert">ログイン状態を確認できませんでした。</p> : session ? <ProfileForm key={session.user.id} userId={session.user.id} /> : <p>プロフィールを保存するには<Link href="/login">ログイン</Link>してください。</p>}</section>
  </div><BottomNavigation active="profile" profileEnabled recommendationsHref="/saved-companies" /></main>;
}
