// Badge.jsx — status/severity pills.
// Severity colours come from the token ladder in globals.css:
//   LOW → warning amber · MEDIUM → orange · HIGH → red
// The whole app stays neutral; only severity carries colour.

const VARIANTS = {
  LOW: "bg-success/10 text-success border-success/25",
  MEDIUM: "bg-warning/10 text-warning border-warning/25",
  HIGH: "bg-danger/10 text-danger border-danger/30",
  neutral: "bg-surface-elevated text-text-secondary border-border",
  accent: "bg-accent-soft text-accent border-accent/25",
  purple: "bg-accent-2-soft text-accent-2 border-accent-2/25",
  info: "bg-info/10 text-info border-info/25",
};

const DOT = {
  LOW: "bg-success",
  MEDIUM: "bg-warning",
  HIGH: "bg-danger",
  info: "bg-info",
  accent: "bg-accent",
  purple: "bg-accent-2",
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
