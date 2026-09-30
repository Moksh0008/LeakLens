// KpiCards.jsx — the six-card executive row.
// Hierarchy: overline label → large tabular figure → movement/context caption.
// The "Potential Leakage" card is the highlighted KPI (subtle accent border),
// mirroring how the reference treats its primary metric.

import { motion } from "framer-motion";
import { formatCompactINR, formatNumber, formatPercent } from "../../utils/format";
import { TrendUpIcon } from "../ui/Icons";

const STAGGER = { animate: { transition: { staggerChildren: 0.05 } } };
const ITEM = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function Movement({ pct, negative = false }) {
  if (pct === undefined) return null;
  const cls = negative ? "text-danger" : "text-success";
  const arrow = negative ? "↓" : "↑";
  return (
    <span className={`tnum mt-2 inline-flex items-center gap-1 text-caption ${cls}`}>
      {arrow} {Math.abs(pct).toFixed(1)}%
      <span className="text-text-muted">vs previous period</span>
    </span>
  );
}

export default function KpiCards({ dashboard }) {
  const d = dashboard;
  const leakageRatePct = d.totalProcurement
    ? (d.potentialLeakage / d.totalProcurement) * 100
    : 0;

  const cards = [
    {
      label: "Total Procurement Spend",
      value: formatCompactINR(d.totalProcurement),
      movement: d.spendChangePct,
      negative: false,
      highlight: false,
    },
    {
      label: "Potential Leakage",
      value: formatCompactINR(d.potentialLeakage),
      movement: d.leakageChangePct,
      negative: true,
      highlight: true,
      context: `${formatPercent(leakageRatePct)} of spend`,
    },
    {
      label: "Potential Missed Savings",
      value: formatCompactINR(d.missedSavings ?? 0),
      context: "recoverable via negotiation",
      highlight: false,
    },
    {
      label: "Transactions Analyzed",
      value: formatNumber(d.transactionsAnalyzed),
      context: "records processed",
      highlight: false,
    },
    {
      label: "Flagged Transactions",
      value: formatNumber(d.flaggedTransactions),
      context: `${d.openInvestigations ?? 0} require investigation`,
      highlight: false,
    },
    {
      label: "Suppliers Analyzed",
      value: formatNumber(d.suppliersAnalyzed ?? 0),
      context: "across all categories",
      highlight: false,
    },
  ];

  return (
    <motion.div
      variants={STAGGER}
      initial="initial"
      animate="animate"
      className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-6"
    >
      {cards.map((card) => (
        <motion.div
          key={card.label}
          variants={ITEM}
          className={`rounded-card border bg-surface p-4 ${
            card.highlight
              ? "border-accent/40 shadow-[0_0_0_1px_rgba(59,130,246,0.15),0_0_20px_rgba(59,130,246,0.08)]"
              : "border-border"
          }`}
        >
          <p className="overline">{card.label}</p>
          <p
            className={`tnum mt-2 text-[24px] font-semibold leading-none ${
              card.highlight ? "text-text-primary" : "text-text-primary"
            }`}
          >
            {card.value}
          </p>
          {card.context && (
            <p className="mt-1.5 text-caption text-text-muted">{card.context}</p>
          )}
          {card.movement !== undefined ? (
            <Movement pct={card.movement} negative={card.negative} />
          ) : (
            <div className="mt-2 flex items-center gap-1.5 text-caption text-text-muted">
              <TrendUpIcon size={12} />
              <span>—</span>
            </div>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
