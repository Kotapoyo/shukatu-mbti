export function IdeaCharacter() {
  return (
    <svg viewBox="0 0 240 190" fill="none" role="img" aria-label="電球を持った紫色のキャラクター">
      <path d="M67 70C42 22 84 0 111 16c16 9 18 29 14 46 26-24 54-8 50 17 26 9 23 37 2 45 22 28-1 46-24 36-3 27-37 29-48 7-19 26-51 16-48-8-29 13-49-16-28-35C-1 103 19 67 48 72c6-1 12-1 19-2Z" fill="var(--color-purple)" />
      <ellipse cx="94" cy="97" rx="18" ry="20" fill="white" /><ellipse cx="126" cy="93" rx="18" ry="20" fill="white" />
      <ellipse cx="100" cy="97" rx="13" ry="15" fill="var(--color-ink)" /><ellipse cx="132" cy="93" rx="13" ry="15" fill="var(--color-ink)" />
      <circle cx="105" cy="90" r="3" fill="white" /><circle cx="137" cy="86" r="3" fill="white" />
      <path d="M104 121q10 10 19-1" stroke="var(--color-ink)" strokeOpacity=".5" strokeWidth="4" strokeLinecap="round" />
      <g transform="rotate(12 191 74)">
        <path d="M167 77c-23-25-4-58 23-58s44 32 23 57c-8 9-10 14-10 23h-25c0-9-3-15-11-22Z" fill="var(--color-yellow)" />
        <path d="M169 43q2-11 15-13" stroke="var(--color-cream)" strokeWidth="6" strokeLinecap="round" />
        <path d="m184 97-5-35q-7-10-10-3c-3 8 18 9 24 1 5-7 12-4 8 3l-8 34" stroke="var(--color-ink)" strokeWidth="3" strokeLinecap="round" />
        <path d="M177 99h28v16h-28z" fill="var(--color-ink)" /><path d="M184 115h14q-7 13-14 0Z" fill="var(--color-ink)" />
        <path d="M164 9 159 0m33 5V-5m27 19 7-8m9 30 10-4" stroke="var(--color-yellow)" strokeWidth="7" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Building({ letter }: { letter: string }) {
  return (
    <svg viewBox="0 0 240 170" fill="none" aria-hidden="true">
      <g fill="var(--color-mint)">
        <path d="M51 154V57l44-12v109H51Z" opacity=".5" /><path d="M91 154V29l59-12 27 14v123H91Z" opacity=".7" />
        <path d="m150 17 27 14v123h-27V17Z" opacity=".9" /><path d="m177 72 29 11v71h-29V72Z" opacity=".5" />
        <ellipse cx="121" cy="158" rx="110" ry="7" opacity=".25" />
      </g>
      <text x="121" y="67" textAnchor="middle" fontSize="31" fontWeight="900" fill="var(--color-cream)" fontFamily="Arial, sans-serif">{letter}</text>
      <g fill="var(--color-cream)" opacity=".8">
        <path d="M62 70h10v14H62zm17-5h9v14h-9zM62 94h10v14H62zm17-5h9v14h-9zM62 118h10v14H62zm17-5h9v14h-9zM103 79h11v15h-11zm22 0h11v15h-11zM103 104h11v15h-11zm22 0h11v15h-11zM115 134h15v20h-15zM184 97h10v13h-10zm0 23h10v13h-10z" />
      </g>
      <g fill="var(--color-mint)"><path d="M26 152v-18c-17-6-11-24-4-26-8-18 9-29 18-14 13 0 20 23 7 32-1 11-7 15-13 12v14h-8ZM211 154v-20c-12-5-15-22-7-30-3-17 16-26 23-10 11 8 7 29-7 36v24h-9Z" /><path d="M36 157c-15-25 22-31 25-12 10-11 27 1 20 12H36Zm123 0c-8-14 7-23 16-17 8-20 34-10 27 7 10-6 21 3 17 10h-60Z" opacity=".7" /></g>
      <g fill="var(--color-mint)" opacity=".16"><path d="M18 42c-8-16 9-30 21-20 8-19 35-10 32 10 16-5 24 12 12 18H20Z" /><path d="M178 49c-8-10 5-22 15-17 5-16 27-10 26 5 17-4 21 11 10 16h-47Z" /></g>
    </svg>
  );
}

export function DetailIcon({ kind }: { kind: "team" | "training" | "building" | "source" }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      {kind === "team" && <g fill="currentColor"><circle cx="16" cy="8" r="4" /><circle cx="6" cy="12" r="3" /><circle cx="26" cy="12" r="3" /><path d="M9 29v-8a7 7 0 0 1 14 0v8H9ZM0 28v-7a6 6 0 0 1 7-6c-1 2-2 5-2 7v6H0Zm27 0v-6c0-2-1-5-2-7a6 6 0 0 1 7 6v7h-5Z" /></g>}
      {kind === "training" && <g fill="currentColor"><path d="m1 11 15-8 15 8-15 8L1 11Zm7 6 8 5 8-5v8c-5 4-11 4-16 0v-8Z" /><path d="M28 14h2v13h-2z" /></g>}
      {kind === "building" && <g fill="currentColor"><path fillRule="evenodd" d="M6 30V5h12v7h8v18H6Zm4-20h3v4h-3v-4Zm0 8h3v4h-3v-4Zm9-1h3v4h-3v-4Zm-6 8h5v5h-5v-5Z" /><path d="M11 0h3v8h-3z" /></g>}
      {kind === "source" && <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3h14v26H5V7h4V3Zm0 0v4h14M10 13h8m-8 6h8m-8 5h5" /></g>}
    </svg>
  );
}
