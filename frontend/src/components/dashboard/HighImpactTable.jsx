// HighImpactTable.jsx — premium evidence table.
// Comfortable 52px rows, hairline separators, right-aligned financials,
// only the columns that matter. Row click → investigation.

import { motion, useReducedMotion } from "framer-motion";
import { formatCompactINR, formatDate, formatINR } from "../../utils/format";
import { DetectionBadge, SeverityBadge } from "../ui/Badges";

export default function HighImpactTable({ items = [], onInvestigate, limit = 6 }) {
  const reduce = useReducedMotion();
  const rows = items.slice(0, limit);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-small">
        <thead>
          <tr className="text-caption text-text-muted">
            <th className="border-b border-border px-4 pb-3 font-medium first:pl-1">Transaction</th>
            <th className="border-b border-border px-4 pb-3 font-medium">Supplier</th>
            <th className="border-b border-border px-4 pb-3 font-medium">Detection</th>
            <th className="border-b border-border px-4 pb-3 text-right font-medium">Actual</th>
            <th className="border-b border-border px-4 pb-3 text-right font-medium">Benchmark</th>
            <th className="border-b border-border px-4 pb-3 text-right font-medium">Potential Impact</th>
            <th className="border-b border-border px-4 pb-3 font-medium last:pr-1">Severity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t, i) => (
            <motion.tr
              key={t.transactionId}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.03 }}
              onClick={() => onInvestigate?.(t)}
              className="cursor-pointer transition-colors hover:bg-surface-hover/60"
            >
              <td className="border-b border-border/60 px-4 py-4 first:pl-1">
                <div className="tnum font-medium text-text-primary">{t.transactionId}</div>
                <div className="mt-0.5 text-caption text-text-muted">
                  {t.product} · {formatDate(t.date)}
                </div>
              </td>
              <td className="border-b border-border/60 px-4 py-4 text-text-secondary">
                {t.supplier}
              </td>
              <td className="border-b border-border/60 px-4 py-4">
                <DetectionBadge type={t.detectionType} />
              </td>
              <td className="tnum border-b border-border/60 px-4 py-4 text-right text-text-secondary">
                {formatINR(t.actualPrice)}
                <div className="mt-0.5 text-caption text-text-muted">× {t.quantity} units</div>
              </td>
              <td className="tnum border-b border-border/60 px-4 py-4 text-right text-text-muted">
                {formatINR(t.benchmarkPrice)}
              </td>
              <td className="tnum border-b border-border/60 px-4 py-4 text-right font-semibold text-danger">
                {formatCompactINR(t.potentialLeakage)}
              </td>
              <td className="border-b border-border/60 px-4 py-4 last:pr-1">
                <SeverityBadge severity={t.severity} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
