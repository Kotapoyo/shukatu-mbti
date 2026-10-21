export default function PasswordCharacter({ visible, className }: { visible: boolean; className: string }) {
  return (
    <svg className={className} viewBox="0 0 240 190" aria-hidden="true" focusable="false">
      <path d="M0 190V53C10 4 55 -7 90 20C116 41 113 70 152 82C196 93 226 108 235 150L240 190Z" fill="var(--color-mint)" />
      {visible ? (
        <>
          <ellipse cx="82" cy="100" rx="19" ry="23" fill="white" transform="rotate(-20 82 100)" />
          <ellipse cx="118" cy="114" rx="18" ry="21" fill="white" transform="rotate(-20 118 114)" />
          <circle cx="87" cy="103" r="13" fill="var(--color-ink)" />
          <circle cx="123" cy="115" r="13" fill="var(--color-ink)" />
          <circle cx="91" cy="97" r="3" fill="white" />
          <circle cx="127" cy="109" r="3" fill="white" />
        </>
      ) : (
        <path d="M64 100Q82 118 100 103M104 119Q122 137 140 122" fill="none" stroke="var(--color-ink)" strokeWidth="7" strokeLinecap="round" />
      )}
    </svg>
  );
}
