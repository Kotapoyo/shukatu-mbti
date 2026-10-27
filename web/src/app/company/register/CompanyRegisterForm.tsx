"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { loadDemoCompanies, nullableFormText, prefectures, ratingsFromForm, saveDemoCompanies, scoredQuestions, type DemoCompany } from "@/lib/demo-data";
import type { QuestionId } from "@/app/diagnosis/recommendations";
import styles from "./page.module.css";

const ratingGuides: Record<QuestionId, { title: string; low: string; high: string }> = {
  "work-style": { title: "仕事内容", low: "頭を使う仕事が中心", high: "体を動かす仕事が中心" },
  commute: { title: "通勤距離", low: "遠距離", high: "近距離" },
  training: { title: "入社後の研修", low: "研修は少ない", high: "研修が充実している" },
  teamwork: { title: "共同作業の多さ", low: "一人で進める仕事が中心", high: "チームで進める仕事が中心" },
  remote: { title: "リモート勤務の割合", low: "出社中心", high: "リモート中心" },
  relocation: { title: "転勤の頻度", low: "転勤が多い", high: "転勤はない" },
  motivation: { title: "扱う商品・サービス", low: "社会基盤など目立たない分野", high: "身近な商品・サービス" },
  "night-shift": { title: "夜勤の有無", low: "夜勤が多い", high: "夜勤はない" },
  "customer-contact": { title: "顧客との直接的な関わり", low: "ほとんどない", high: "日常的にある" },
  autonomy: { title: "仕事の進め方の裁量", low: "決まった手順が中心", high: "本人が決められる" },
  "work-variety": { title: "仕事内容の変化", low: "決まった仕事が中心", high: "新しい課題が多い" },
  "career-breadth": { title: "経験できる仕事の幅", low: "専門分野を深める", high: "幅広い仕事を経験する" },
};

function Editor({ userId }: { userId: string }) {
  const [companies, setCompanies] = useState<DemoCompany[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      setCompanies(loadDemoCompanies(window.localStorage, userId));
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [userId]);

  const editing = companies.find((company) => company.id === editingId);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const company: DemoCompany = {
      id: editingId ?? `demo-${crypto.randomUUID()}`,
      name: String(form.get("companyName") ?? "").trim(),
      industry: nullableFormText(form.get("industry")),
      description: nullableFormText(form.get("description")),
      location: String(form.get("location") ?? ""),
      monthlySalaryYen: Number(form.get("monthlySalaryYen")),
      holidays: nullableFormText(form.get("holidays")),
      plannedHires: form.get("plannedHires") ? Number(form.get("plannedHires")) : null,
      workStyle: nullableFormText(form.get("workStyle")),
      benefits: nullableFormText(form.get("benefits")),
      applicationUrl: nullableFormText(form.get("applicationUrl")),
      sourceUrl: nullableFormText(form.get("sourceUrl")),
      verifiedAt: nullableFormText(form.get("verifiedAt")),
      recruitingGraduates: form.get("recruitingGraduates") === "yes",
      ratings: ratingsFromForm(form),
    };
    const next = editingId ? companies.map((item) => item.id === editingId ? company : item) : [...companies, company];
    try {
      saveDemoCompanies(window.localStorage, userId, next);
      setCompanies(next);
      setEditingId(null);
      event.currentTarget.reset();
      setMessage("保存しました。次に診断結果を開くと、登録した企業も照合します。");
    } catch {
      setMessage("保存できませんでした。入力内容とブラウザーの保存設定を確認してください。");
    }
  }

  if (status === "loading") return <p>デモ企業を読み込んでいます。</p>;
  if (status === "error") return <p role="alert">保存済みデモ企業を読み込めませんでした。ブラウザーのデモデータを確認してください。</p>;

  return <>
    {companies.length > 0 && <section className={styles.registered} aria-label="登録済みのデモ企業"><h2>登録済みのデモ企業</h2><ul>{companies.map((company) => <li key={company.id}><span>{company.name}</span><button type="button" onClick={() => { setEditingId(company.id); setMessage(""); }}>編集する</button></li>)}</ul></section>}
    <form className={styles.form} onSubmit={submit} key={editingId ?? "new"}>
      <fieldset className={styles.section}><legend><span className={styles.number}>1</span> 企業について</legend><div className={styles.fields}>
        <label className={styles.field}><span>企業名</span><input type="text" name="companyName" maxLength={120} required defaultValue={editing?.name ?? ""} placeholder="例：株式会社サンプル" autoComplete="organization" /></label>
        <label className={styles.field}><span>業界</span><input type="text" name="industry" maxLength={120} defaultValue={editing?.industry ?? ""} placeholder="例：情報・通信" /></label>
        <label className={`${styles.field} ${styles.full}`}><span>事業内容</span><textarea name="description" rows={3} maxLength={2000} defaultValue={editing?.description ?? ""} placeholder="事業やサービスについて入力" /></label>
      </div></fieldset>
      <fieldset className={styles.section}><legend><span className={styles.number}>2</span> 募集条件</legend><div className={styles.fields}>
        <label className={styles.field}><span>勤務地（都道府県）</span><select name="location" defaultValue={editing?.location ?? ""} required><option value="" disabled>勤務地を選択</option>{prefectures.map((place) => <option key={place} value={place}>{place}</option>)}</select></label>
        <label className={styles.field}><span>月給（円）</span><input type="number" name="monthlySalaryYen" min="0" max="10000000" step="1000" required defaultValue={editing?.monthlySalaryYen ?? ""} placeholder="例：250000" /></label>
        <label className={styles.field}><span>休日</span><input type="text" name="holidays" maxLength={120} defaultValue={editing?.holidays ?? ""} placeholder="例：年間休日120日" /></label>
        <label className={styles.field}><span>採用予定人数</span><input type="number" name="plannedHires" min="0" max="100000" defaultValue={editing?.plannedHires ?? ""} placeholder="例：5" /></label>
        <label className={styles.field}><span>新卒募集</span><select name="recruitingGraduates" defaultValue={editing?.recruitingGraduates === false ? "no" : "yes"}><option value="yes">募集中</option><option value="no">募集していない</option></select></label>
      </div></fieldset>
      <fieldset className={styles.section}><legend><span className={styles.number}>3</span> 働き方・福利厚生</legend><div className={styles.fields}>
        <label className={styles.field}><span>働き方</span><textarea name="workStyle" rows={3} maxLength={2000} defaultValue={editing?.workStyle ?? ""} placeholder="勤務形態や職場の特徴など" /></label>
        <label className={styles.field}><span>福利厚生</span><textarea name="benefits" rows={3} maxLength={2000} defaultValue={editing?.benefits ?? ""} placeholder="提供している制度など" /></label>
      </div><p className={styles.helper}>次の11項目は学生の診断回答と比べる値です。通勤距離の回答は現在の判定に使いません。</p>
      <div className={styles.ratings}>{scoredQuestions.map((question) => <label className={styles.field} key={question.id}><span>{ratingGuides[question.id].title}</span><small>1：{ratingGuides[question.id].low} ／ 5：{ratingGuides[question.id].high}</small><select name={`rating-${question.id}`} defaultValue={editing?.ratings[question.id] ?? ""} required><option value="" disabled>評価を選択</option>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}</select></label>)}</div>
      </fieldset>
      <fieldset className={styles.section}><legend><span className={styles.number}>4</span> 応募先・情報の出典</legend><div className={styles.fields}>
        <label className={`${styles.field} ${styles.full}`}><span>公式応募先URL</span><input type="url" name="applicationUrl" maxLength={2000} defaultValue={editing?.applicationUrl ?? ""} placeholder="https://example.com/recruit" /></label>
        <label className={styles.field}><span>出典URL</span><input type="url" name="sourceUrl" maxLength={2000} defaultValue={editing?.sourceUrl ?? ""} placeholder="https://example.com/" /></label>
        <label className={styles.field}><span>自己申告日</span><input type="date" name="verifiedAt" defaultValue={editing?.verifiedAt ?? ""} /></label>
      </div><p className={styles.helper}>入力されたURLや日付は、第三者が確認したことを意味しません。</p></fieldset>
      <div className={styles.actions}><button type="submit">{editing ? "変更を保存する" : "デモ企業を登録する"}</button>{editing && <button className={styles.cancel} type="button" onClick={() => setEditingId(null)}>新規登録に戻る</button>}{message && <p role="status">{message}</p>}{message.startsWith("保存しました") && <Link href="/diagnosis/results">診断結果で確認する</Link>}</div>
    </form>
  </>;
}

export default function CompanyRegisterForm() {
  const { data: session, isPending, error } = authClient.useSession();
  if (isPending) return <p>ログイン状態を確認しています。</p>;
  if (error) return <p role="alert">ログイン状態を確認できませんでした。</p>;
  if (!session) return <p>デモ企業を登録するには<Link href="/login">ログイン</Link>してください。</p>;
  return <Editor key={session.user.id} userId={session.user.id} />;
}
