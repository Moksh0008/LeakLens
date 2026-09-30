import { motion, useReducedMotion } from "framer-motion";
import { formatCompactINR, formatNumber } from "../../utils/format";

/**
 * SectionCard — quiet data panel: card title + small supporting
 * description, 24px padding, hairline border, barely-there shadow.
 */
export default function SectionCard({ title, subtitle, action, className = "", children, delay = 0 }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className={`flex flex-col rounded-card border border-border bg-surface shadow-[var(--shadow-card)] ${className}`}
    >
      <header className="flex items-start justify-between gap-4 px-6 pb-4 pt-5">
        <div>
          <h2 className="text-card font-semibold text-text-primary">{title}</h2>
          {subtitle && <p className="mt-1 text-small text-text-muted">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="min-h-0 flex-1 px-6 pb-6">{children}</div>
    </motion.section>
  );
}

/** Small quiet action link used in section headers. */
export function ViewAllLink({ to, onClick, children = "View all" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-control text-small font-medium text-accent transition-colors hover:text-accent-strong"
    >
      {children} →
    </button>
  );
}

/** Formatted totals shown in chart headers. */
export function HeaderTotals({ value, count }) {
  return (
    <span className="tnum shrink-0 text-caption text-text-muted">
      {formatCompactINR(value)} · {formatNumber(count)} flags
    </span>
  );
}
