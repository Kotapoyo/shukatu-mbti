export default function CompanyIllustration({ letter }: { letter: string }) {
  return (
    <svg viewBox="0 0 240 240" fill="none" aria-hidden="true">
      <path d="M24 83C7 44 57 26 95 15c44-13 75 7 83 49 7 37 53 45 48 86-6 42-49 69-98 68-57-1-101-16-104-58-2-27 12-47 0-77Z" fill="currentColor" opacity=".14" />
      <path d="m51 216 1-151 89-10 26 20v141H51Z" fill="currentColor" opacity=".8" />
      <path d="m141 55 26 20v141h-26V55Z" fill="currentColor" />
      <path d="M167 110h25a8 8 0 0 1 8 8v98h-33V110Z" fill="currentColor" opacity=".65" />
      <path d="m63 76 66-7v147H63V76Z" fill="var(--color-cream)" />
      <text x="96" y="121" textAnchor="middle" fill="currentColor" fontSize="43" fontWeight="800" fontFamily="Arial, sans-serif">{letter}</text>
      <g fill="currentColor" opacity=".5">
        <rect x="73" y="139" width="14" height="17" rx="1" /><rect x="102" y="139" width="14" height="17" rx="1" />
        <rect x="73" y="170" width="14" height="17" rx="1" /><rect x="102" y="170" width="14" height="17" rx="1" />
        <rect x="88" y="199" width="17" height="17" rx="1" /><rect x="176" y="130" width="11" height="16" rx="1" />
        <rect x="176" y="159" width="11" height="16" rx="1" /><rect x="176" y="188" width="11" height="16" rx="1" />
      </g>
      <path d="M31 216v-32m176 32v-43" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M15 196c-7-12 5-24 13-17-3-21 20-24 23-7 17-4 24 18 10 26 2 14-15 19-22 10-8 10-25 3-24-12Zm180-26c-10-18-3-41 10-41 16 0 23 29 14 43-7 11-17 10-24-2Z" fill="currentColor" opacity=".85" />
    </svg>
  );
}
