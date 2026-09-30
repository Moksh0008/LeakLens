import { motion } from "framer-motion";
import { formatCompactINR, formatNumber, formatPercent } from "../../utils/format";
import { TrendUpIcon } from "../ui/Icons";

const STAGGER = { animate: { transition: { staggerChildren: 0.06 } } };
const ITEM = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

/**
 * Row of the four agreed KPIs:
 * Total Procurement · Potential Leakage · Transactions Analyzed · Flagged Transactions
 */
export default function KpiCards({ dashboard }) {
  const leakageRatePct = dashboard.totalProcurement
    ? (dashboard.potentialLeakage / dashboard.totalProcurement) * 100
    : 0;

  const cards = [
    {
      label: "Total Procurement",
      value: formatCompactINR(dashboard.totalProcurement),
      sub: `${formatNumber(dashboard.transactionsAnalyzed)} transactions analyzed`,
      accent: "text-ink-900",
    },
    {
      label: "Potential Leakage",
      value: formatCompactINR(dashboard.potentialLeakage),
      sub: `${formatPercent(leakageRatePct)} of total spend`,
      accent: "text-red-600",
      dot: "bg-red-500",
    },
    {
      label: "Transactions Analyzed",
      value: formatNumber(dashboard.transactionsAnalyzed),
      sub: "procurement records processed",
      accent: "text-ink-900",
    },
    {
      label: "Flagged Transactions",
      value: formatNumber(dashboard.flaggedTransactions),
      sub: `${dashboard.openInvestigations ?? 0} high-severity open`,
      accent: "text-ink-900",
    },
  ];

  return (
    <motion.div
      variants={STAGGER}
      initial="initial"
      animate="animate"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {cards.map((card) => (
        <motion.div
          key={card.label}
          variants={ITEM}
          className="rounded-xl border border-ink-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
        >
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-ink-500">{card.label}</p>
            {card.dot ? (
              <span className={`h-2 w-2 rounded-full ${card.dot} animate-pulse`} />
            ) : (
              <TrendUpIcon size={16} className="text-ink-300" />
            )}
          </div>
          <p className={`tnum mt-2 text-[28px] font-semibold leading-none ${card.accent}`}>
            {card.value}
          </p>
          <p className="mt-2.5 text-xs text-ink-400">{card.sub}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
