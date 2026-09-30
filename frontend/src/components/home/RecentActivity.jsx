// RecentActivity.jsx — compact recent-findings table.
// Readable 52px rows, hairline separators, horizontal scroll on narrow
// screens. "View all transactions →" hands off to /transactions.

import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { formatCompactINR } from "../../utils/format";
import { DetectionBadge, SeverityBadge, DETECTION_LABELS } from "../ui/Badges";

export default function RecentActivity({ items }) {
  const reduce = useReducedMotion();
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-small">
          <thead>
            <tr className="text-caption text-text-muted">
              {["Transaction", "Product", "Supplier", "Amount", "Finding", "Severity"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={`border-b border-border pb-3 font-medium ${
                      i === 3 ? "text-right" : ""
                    } ${i === 0 ? "pr-4" : "px-4"} ${i === 5 ? "text-right" : ""}`}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((t, i) => (
              <motion.tr
                key={t.transactionId}
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.04 }}
                className="transition-colors hover:bg-surface-hover/50"
              >
                <td className="tnum border-b border-border/60 py-4 pr-4 font-medium text-text-primary">
                  {t.transactionId}
                </td>
                <td className="border-b border-border/60 px-4 py-4 text-text-secondary">
                  {t.product}
                </td>
                <td className="border-b border-border/60 px-4 py-4 text-text-secondary">
                  {t.supplier}
                </td>
                <td className="tnum border-b border-border/60 px-4 py-4 text-right text-text-primary">
                  {formatCompactINR(t.amount)}
                </td>
                <td className="border-b border-border/60 px-4 py-4">
                  <DetectionBadge
                    type={DETECTION_LABELS[t.finding] ? t.finding : "NONE"}
                  />
                  {!DETECTION_LABELS[t.finding] && (
                    <span className="ml-2 text-caption text-text-secondary">{t.finding}</span>
                  )}
                </td>
                <td className="border-b border-border/60 px-4 py-4 text-right">
                  <SeverityBadge severity={t.severity} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 flex justify-end">
        <Link
          to="/transactions"
          className="text-small font-medium text-accent transition-colors hover:text-accent-strong"
        >
          View all transactions →
        </Link>
      </div>
    </div>
  );
}
