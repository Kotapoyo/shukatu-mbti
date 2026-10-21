import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "企業情報登録（画面案） | 企業MBTI",
  icons: { icon: "/images/character-flower.svg" },
};

export default function CompanyRegisterPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <Link className={styles.backLink} href="/" aria-label="ホームへ戻る">
            <span aria-hidden="true">←</span> ホームへ戻る
          </Link>
          <span className={styles.brand}>企業<span>M</span><span>B</span><span>T</span><span>I</span></span>
        </header>

        <div className={styles.intro}>
          <div>
            <p className={styles.eyebrow}>企業向け · 画面案</p>
            <h1>企業情報の登録</h1>
            <p className={styles.lead}>自社の募集条件や働き方を整理するための入力画面です。</p>
          </div>
          <div className={styles.illustration} aria-hidden="true">
            <Image src="/images/companies.svg" alt="" width={112} height={112} unoptimized />
          </div>
        </div>

        <p className={styles.notice}>
          入力項目・選択肢は検討中です。この画面では保存・公開されません。
        </p>

        <form className={styles.form}>
          <fieldset className={styles.section}>
            <legend><span className={styles.number}>1</span> 企業について</legend>
            <div className={styles.fields}>
              <label className={styles.field}>
                <span>企業名</span>
                <input type="text" name="companyName" placeholder="例：株式会社サンプル" autoComplete="organization" />
              </label>
              <label className={styles.field}>
                <span>業界</span>
                <input type="text" name="industry" placeholder="例：情報・通信" />
              </label>
              <label className={`${styles.field} ${styles.full}`}>
                <span>事業内容</span>
                <textarea name="description" rows={3} placeholder="事業やサービスについて入力" />
              </label>
            </div>
          </fieldset>

          <fieldset className={styles.section}>
            <legend><span className={styles.number}>2</span> 募集条件</legend>
            <div className={styles.fields}>
              <label className={styles.field}>
                <span>勤務地</span>
                <input type="text" name="location" placeholder="例：東京都" />
              </label>
              <label className={styles.field}>
                <span>給与</span>
                <input type="text" name="salary" placeholder="金額・単位を入力" />
              </label>
              <label className={styles.field}>
                <span>休日</span>
                <input type="text" name="holidays" placeholder="例：年間休日120日" />
              </label>
              <label className={styles.field}>
                <span>採用予定人数</span>
                <input type="text" name="plannedHires" inputMode="numeric" placeholder="例：5人" />
              </label>
            </div>
          </fieldset>

          <fieldset className={styles.section}>
            <legend><span className={styles.number}>3</span> 働き方・福利厚生</legend>
            <div className={styles.fields}>
              <label className={styles.field}>
                <span>働き方</span>
                <textarea name="workStyle" rows={3} placeholder="勤務形態や職場の特徴など" />
              </label>
              <label className={styles.field}>
                <span>福利厚生</span>
                <textarea name="benefits" rows={3} placeholder="提供している制度など" />
              </label>
            </div>
            <p className={styles.helper}>診断に使用する5段階の評価項目は、設問との対応が決まってから追加します。</p>
          </fieldset>

          <fieldset className={styles.section}>
            <legend><span className={styles.number}>4</span> 応募先・情報の確認</legend>
            <div className={styles.fields}>
              <label className={`${styles.field} ${styles.full}`}>
                <span>公式応募先URL</span>
                <input type="url" name="applicationUrl" placeholder="https://example.com/recruit" inputMode="url" />
              </label>
              <label className={styles.field}>
                <span>出典URL</span>
                <input type="url" name="sourceUrl" placeholder="https://example.com/" inputMode="url" />
              </label>
              <label className={styles.field}>
                <span>確認日</span>
                <input type="date" name="verifiedAt" />
              </label>
            </div>
            <p className={styles.helper}>企業の自己申告だけでは「確認済み」と表示しません。</p>
          </fieldset>

          <div className={styles.actions}>
            <button type="button" disabled>保存機能は準備中です</button>
            <p>登録項目、権限確認、保存先が決まってから利用できます。</p>
          </div>
        </form>
      </div>
    </main>
  );
}
