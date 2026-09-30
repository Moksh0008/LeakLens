// KpiCards.jsx — four primary metrics. Calm and spacious:
// small uppercase label, large number, one line of context.
// Potential Leakage gets quiet emphasis through a hairline accent tint
// on the left edge — no glow, no icons.

import { motion, useReducedMotion } from "framer-motion";
import { formatCompactINR, formatNumber, formatPercent } from "../../utils/format";

const STAGGER = { animate: { transition: { staggerChildren: 0.06 } } };

export default function KpiCards({ dashboard }) {
  const reduce = useReducedMotion();
  const d = dashboard;
  const leakageRatePct = d.totalProcurement
    ? (d.potentialLeakage / d.totalProcurement) * 100
    : 0;

  const cards = [
    {
      label: "Total Procurement Spend",
      value: formatCompactINR(d.totalProcurement),
      context: `${formatNumber(d.transactionsAnalyzed)} transactions analyzed`,
    },
    {
      label: "Potential Leakage",
      value: formatCompactINR(d.potentialLeakage),
      context: `${formatPercent(leakageRatePct)} of procurement spend`,
      emphasis: true,
    },
    {
      label: "Potential Missed Savings",
      value: formatCompactINR(d.missedSavings ?? 0),
      context: "recoverable via negotiation",
    },
    {
      label: "Flagged Transactions",
      value: formatNumber(d.flaggedTransactions),
      context: `${d.openInvestigations ?? 0} require investigation`,
    },
  ];

  return (
    <motion.div
      variants={STAGGER}
      initial={reduce ? false : "initial"}
      animate="animate"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <motion.div
          key={card.label}
          variants={{
            initial: { opacity: 0, y: 10 },
            animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
          }}
          className={`relative rounded-card border border-border bg-surface p-6 shadow-[var(--shadow-card)] ${
            card.emphasis ? "before:absolute before:inset-y-4 before:left-0 before:w-0.5 before:rounded-full before:bg-accent before:content-['']" : ""
          }`}
        >
          <p className="overline">{card.label}</p>
          <p className="tnum mt-3 text-[28px] font-semibold leading-none tracking-[-0.01em] text-text-primary">
            {card.value}
          </p>
          <p className="mt-3 text-small text-text-muted">{card.context}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
