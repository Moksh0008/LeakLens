import { motion } from "framer-motion";
import { formatCompactINR, formatNumber } from "../../utils/format";

/**
 * SectionCard — one consistent frame for every dashboard panel:
 * title + optional subtitle + optional header-right action (e.g. "View all").
 * Panels fade/slide in as they mount for a subtle, professional feel.
 */
export default function SectionCard({ title, subtitle, action, className = "", children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
      className={`flex flex-col rounded-card border border-border bg-surface shadow-[var(--shadow-card)] ${className}`}
    >
      <header className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 pb-3 pt-4">
        <div>
          <h2 className="text-[15px] font-semibold text-ink-800">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-ink-400">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="min-h-0 flex-1 px-5 pb-4 pt-3">{children}</div>
    </motion.section>
  );
}

/** Small "View all →" link used in section headers. */
export function ViewAllLink({ to, onClick, children = "View all" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-md text-xs font-medium text-brand-600 transition hover:text-brand-700"
    >
      {children} →
    </button>
  );
}

/** Formatted totals shown in chart headers (e.g. "₹1.84M across 386 flags"). */
export function HeaderTotals({ value, count }) {
  return (
    <span className="tnum shrink-0 text-xs text-ink-400">
      {formatCompactINR(value)} · {formatNumber(count)} flags
    </span>
  );
}
