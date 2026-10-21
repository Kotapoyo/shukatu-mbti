import Link from "next/link";
import styles from "./page.module.css";

const schoolTypes = ["大学", "短大", "専門学校", "高校卒"];
const prefectures = [
	"北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
	"茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
	"新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
	"静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
	"奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
	"徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
	"熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
];

export default function ProfilePage() {
	return (
		<main className={styles.page}>
			<div className={styles.container}>
				<header className={styles.header}>
					<Link className={styles.backLink} href="/">ホームへ戻る</Link>
					<div className={styles.brand} aria-label="企業MBTI">
						<span>企</span><span>業</span><span>M</span><span>B</span><span>T</span><span>I</span>
					</div>
				</header>

				<section className={styles.intro} aria-labelledby="profile-title">
					<p className={styles.eyebrow}>YOUR PROFILE</p>
					<h1 className={styles.title} id="profile-title">あなたのことを<br />教えてください。</h1>
					<p className={styles.description}>プロフィールを登録すると、あなたに合う企業を探しやすくなります。</p>
				</section>

				<section className={styles.formCard} aria-labelledby="profile-form-title">
					<form className={styles.form}>
						<h2 className={styles.sectionTitle} id="profile-form-title">基本情報</h2>

						<fieldset className={styles.fields}>
							<div className={`${styles.field} ${styles.fullWidth}`}>
								<label htmlFor="graduation-year">卒業予定年<span className={styles.required}>必須</span></label>
								<select className={styles.select} id="graduation-year" name="graduationYear" defaultValue="">
									<option value="" disabled>卒業予定年を選択</option>
									{Array.from({ length: 8 }, (_, index) => {
										const year = new Date().getFullYear() + index;
										return <option key={year} value={year}>{year}年</option>;
									})}
								</select>
							</div>

							<div className={styles.field}>
								<label htmlFor="school-type">学校種別<span className={styles.required}>必須</span></label>
								<select className={styles.select} id="school-type" name="schoolType" defaultValue="">
									<option value="" disabled>学校種別を選択</option>
									{schoolTypes.map((schoolType) => <option key={schoolType} value={schoolType}>{schoolType}</option>)}
								</select>
							</div>

							<div className={styles.field}>
								<label htmlFor="age">年齢</label>
								<input className={styles.input} id="age" name="age" type="number" min="15" max="100" placeholder="例：21" />
							</div>

							<div className={`${styles.field} ${styles.fullWidth}`}>
								<label htmlFor="school-name">学校名<span className={styles.required}>必須</span></label>
								<input className={styles.input} id="school-name" name="schoolName" type="text" placeholder="例：企業MBTI大学" />
							</div>

							<div className={`${styles.field} ${styles.fullWidth}`}>
								<label htmlFor="major">専攻・学んでいる分野</label>
								<input className={styles.input} id="major" name="major" type="text" placeholder="例：情報工学、経済学" />
							</div>

							<div className={styles.field}>
								<label htmlFor="work-location">希望勤務地<span className={styles.required}>必須</span></label>
								<select className={styles.select} id="work-location" name="workLocation" defaultValue="">
									<option value="" disabled>都道府県を選択</option>
									{prefectures.map((prefecture) => <option key={prefecture} value={prefecture}>{prefecture}</option>)}
								</select>
							</div>

							<div className={styles.field}>
								<label htmlFor="gender">性別</label>
								<select className={styles.select} id="gender" name="gender" defaultValue="">
									<option value="" disabled>回答しない</option>
									<option value="女性">女性</option>
									<option value="男性">男性</option>
									<option value="その他">その他</option>
								</select>
							</div>

							<div className={`${styles.field} ${styles.fullWidth}`}>
								<label htmlFor="hobbies">趣味</label>
								<textarea className={styles.textarea} id="hobbies" name="hobbies" placeholder="好きなこと、休日の過ごし方など" />
							</div>
						</fieldset>

						<p className={styles.notice}>プロフィールの登録機能は準備中です。入力内容は現在保存されません。</p>
						<button className={styles.submit} type="button" disabled>プロフィールを登録する</button>
					</form>
				</section>
			</div>
		</main>
	);
}
