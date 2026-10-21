import Image from "next/image";

// 起動: npm run dev
// 画像を public/images/ に置き、下のパスを変更すると差し替えできます。
// PNG / WebP / SVG / JPEG に対応。透明背景の画像がおすすめです。
const homeAssets = {
  hero: "/images/character-flower.svg",
  conditions: "/images/clipboard.svg",
  compatibility: "/images/character-flower.svg",
  companies: "/images/companies.svg",
  friendBlue: "/images/friend-blue.svg",
  friendMint: "/images/friend-mint.svg",
};

const steps = [
  { number: "1", image: homeAssets.conditions, lines: ["希望条件を", "入力する"] },
  { number: "2", image: homeAssets.compatibility, lines: ["働き方の相性を", "診断する"] },
  { number: "3", image: homeAssets.companies, lines: ["あなたに合う", "企業を提案"] },
];

export default function Home() {
  return (
    <main className="landing relative isolate mx-auto overflow-hidden">
      <header className="brand flex items-center justify-center" aria-label="企業MBTI">
        <span className="brand-rays" aria-hidden="true"><i /><i /><i /></span>
        <span className="brand-company">企業</span>
        <span className="brand-letters" aria-hidden="true"><b>M</b><b>B</b><b>T</b><b>I</b></span>
        <span className="brand-rays brand-rays-right" aria-hidden="true"><i /><i /><i /></span>
      </header>

      <section className="hero text-center" aria-labelledby="hero-title">
        <div className="hero-art relative mx-auto">
          <span className="accent accent-yellow" aria-hidden="true"><i /><i /></span>
          <svg className="mint-loop" viewBox="0 0 100 100" aria-hidden="true"><path d="M10 25C40 0 81 17 68 48C53 77 28 44 57 34C89 22 111 61 90 86" /></svg>
          <span className="character-shadow" aria-hidden="true" />
          <Image className="hero-character" src={homeAssets.hero} width={400} height={380} alt="笑顔の赤いお花のキャラクター" priority unoptimized />
          <span className="accent accent-purple" aria-hidden="true"><i /><i /></span>
        </div>
        <h1 id="hero-title">あなたに合う企業を、<br />見つけよう。</h1>
        <p className="hero-description">希望条件と働き方の相性から、<br />企業選びをもっと手軽に。</p>
        <button className="start-button relative flex w-full items-center justify-center" type="button" disabled>
          診断を始める<span className="button-chevron" aria-hidden="true" />
        </button>
      </section>

      <section className="steps-section" aria-label="企業選びの3ステップ">
        <ol className="steps grid grid-cols-3">
          {steps.map((step) => (
            <li className="step-card relative flex flex-col items-center text-center" key={step.number}>
              <span className={`step-number step-number-${step.number}`}>{step.number}</span>
              <Image className="step-image" src={step.image} width={120} height={120} alt="" unoptimized />
              <p>{step.lines[0]}<br />{step.lines[1]}</p>
            </li>
          ))}
        </ol>
      </section>

      <footer className="footer relative text-center">
        <Image className="footer-friend footer-friend-blue" src={homeAssets.friendBlue} width={240} height={190} alt="" unoptimized />
        <span className="footer-dot yellow-dot" aria-hidden="true" />
        <span className="footer-flower" aria-hidden="true">✿</span>
        <span className="footer-dot coral-dot" aria-hidden="true" />
        <p>性格診断は企業選びの参考です。</p>
        <Image className="footer-friend footer-friend-mint" src={homeAssets.friendMint} width={240} height={190} alt="" unoptimized />
      </footer>
    </main>
  );
}

