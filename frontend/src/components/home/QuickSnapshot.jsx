// QuickSnapshot.jsx — four compact KPIs. Quieter than the dashboard's
// executive row: same card language, smaller numbers, entrance stagger.

import { motion, useReducedMotion } from "framer-motion";
import { formatCompactINR, formatNumber } from "../../utils/format";

const FORMATTERS = {
  compactINR: formatCompactINR,
  number: formatNumber,
};

export default function QuickSnapshot({ items }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4"
    >
      {items.map((kpi) => (
        <motion.div
          key={kpi.label}
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
          }}
          className={`relative rounded-card border border-border bg-surface p-5 shadow-[var(--shadow-card)] ${
            kpi.emphasis
              ? "before:absolute before:inset-y-4 before:left-0 before:w-0.5 before:rounded-full before:bg-accent before:content-['']"
              : ""
          }`}
        >
          <p className="text-small text-text-secondary">{kpi.label}</p>
          <p className="tnum mt-2.5 text-[24px] font-semibold leading-none text-text-primary">
            {FORMATTERS[kpi.format](kpi.value)}
          </p>
          <p className="mt-2.5 text-caption text-text-muted">{kpi.context}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
