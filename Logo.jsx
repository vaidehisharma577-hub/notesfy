export default function Logo({ size = 32, text = true }) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="9" fill="var(--primary)" />
        <path d="M10 9h12v14H10z" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
        <path d="M13 14h6M13 18h4" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {text && (
        <span className="logo-text">
          Notesfy<i>.</i>
        </span>
      )}
    </span>
  );
}
