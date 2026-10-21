export default function PasswordCharacter({ visible, className }: { visible: boolean; className: string }) {
  return (
    <svg className={className} viewBox="0 0 400 380" aria-hidden="true" focusable="false">
      <path d="M200 17C144 16 112 65 129 118C77 87 25 112 18 159C9 209 43 246 91 247C51 283 52 331 88 352C128 377 166 351 191 314C215 364 258 385 299 358C334 333 330 287 304 259C356 267 391 228 383 180C376 133 324 110 281 137C303 80 274 18 220 17Z" fill="var(--color-coral)" stroke="var(--color-ink)" strokeWidth="8" strokeLinejoin="round" />
      {visible ? (
        <>
          <ellipse cx="173" cy="164" rx="34" ry="37" fill="white" />
          <ellipse cx="237" cy="178" rx="33" ry="36" fill="white" />
          <ellipse cx="184" cy="161" rx="23" ry="26" fill="var(--color-ink)" />
          <ellipse cx="249" cy="176" rx="23" ry="26" fill="var(--color-ink)" />
          <circle cx="194" cy="148" r="5" fill="white" />
          <circle cx="259" cy="163" r="5" fill="white" />
        </>
      ) : (
        <path d="M145 165Q173 195 201 170M213 180Q240 210 267 185" fill="none" stroke="var(--color-ink)" strokeWidth="12" strokeLinecap="round" />
      )}
      <path d="M180 213Q195 239 216 220" fill="none" stroke="var(--color-ink)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
