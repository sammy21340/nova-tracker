import "../styles/Brand.css";

// The logo mark (a rising line on a black tile) plus the wordmark.
export default function Brand({ size = 24 }) {
  return (
    <span className="brand">
      <svg
        className="brand-mark"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect width="24" height="24" rx="7" fill="#111" />
        <path
          d="M6 15.5 10 11.5 13 13.5 18 8.5"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="8.5" r="1.6" fill="#fff" />
      </svg>
      <span className="brand-name">Portiva</span>
    </span>
  );
}