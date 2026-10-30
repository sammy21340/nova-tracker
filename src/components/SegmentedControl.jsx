import "../styles/SegmentedControl.css";

// A row of options with one dark "thumb" that slides behind the active one.
//
// The thumb never gets its own state. We just tell CSS which slot is active
// (--seg-index) and how many slots there are (--seg-count). When the index
// changes, the CSS transition on `transform` animates the slide for free.
export default function SegmentedControl({ options, value, onChange, label }) {
  const found = options.findIndex((o) => o.value === value);
  const index = found === -1 ? 0 : found;

  return (
    <div
      className="seg"
      role="group"
      aria-label={label}
      style={{ "--seg-count": options.length, "--seg-index": index }}
    >
      <span className="seg-thumb" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="seg-btn"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}