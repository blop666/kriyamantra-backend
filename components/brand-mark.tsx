type BrandMarkProps = { dark?: boolean };

export function BrandMark({ dark = false }: BrandMarkProps) {
  return (
    <div className={`brand-mark ${dark ? "brand-mark-dark" : ""}`} aria-label="KriyaMantra">
      <span className="brand-symbol" aria-hidden="true">
        <svg viewBox="0 0 48 48" role="img">
          <path d="M24 5c5 8 13 11 13 20a13 13 0 1 1-26 0C11 16 19 13 24 5Z" />
          <path d="M24 14c-1 7-6 10-6 15a6 6 0 0 0 12 0c0-5-5-8-6-15Z" />
          <path d="M24 28v11M18 33c4-2 8-2 12 0" />
        </svg>
      </span>
      <span className="brand-wordmark"><strong>Kriya</strong><em>Mantra</em></span>
    </div>
  );
}
