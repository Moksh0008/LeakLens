// Badge.jsx — status/severity pills.
// Severity colours come from the token ladder in globals.css:
//   LOW → warning amber · MEDIUM → orange · HIGH → red
// The whole app stays neutral; only severity carries colour.

const VARIANTS = {
  LOW: "bg-severity-low/10 text-severity-low border-severity-low/25",
  MEDIUM: "bg-severity-medium/10 text-severity-medium border-severity-medium/25",
  HIGH: "bg-severity-high/10 text-severity-high border-severity-high/25",
  neutral: "bg-surface-elevated text-text-secondary border-border",
  accent: "bg-accent-soft text-accent border-accent/25",
};

const DOT = {
  LOW: "bg-severity-low",
  MEDIUM: "bg-severity-medium",
  HIGH: "bg-severity-high",
};

export default function Badge({ variant = "neutral", dot = false, className = "", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide ${VARIANTS[variant] || VARIANTS.neutral} ${className}`}
    >
      {dot && VARIANTS[variant] && (
        <span className={`h-1.5 w-1.5 rounded-full ${DOT[variant] || "bg-current"}`} />
      )}
      {children}
    </span>
  );
}
