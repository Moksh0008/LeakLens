import { motion } from "framer-motion";
import { formatCompactINR, formatDate, formatINR } from "../../utils/format";
import { DetectionBadge, SeverityBadge } from "../ui/Badges";

/**
 * High-impact transactions — top leakage records sorted by amount.
 * Clicking a row triggers onInvestigate(transactionId) so the dashboard
 * can hand the record to the investigation flow.
 */
export default function HighImpactTable({ items = [], onInvestigate, limit = 8 }) {
  const rows = items.slice(0, limit);

  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">
            <th className="border-b border-ink-100 px-3 pb-2 font-semibold">Transaction</th>
            <th className="border-b border-ink-100 px-3 pb-2 font-semibold">Supplier</th>
            <th className="border-b border-ink-100 px-3 pb-2 font-semibold">Detection</th>
            <th className="border-b border-ink-100 px-3 pb-2 text-right font-semibold">Actual</th>
            <th className="border-b border-ink-100 px-3 pb-2 text-right font-semibold">Benchmark</th>
            <th className="border-b border-ink-100 px-3 pb-2 text-right font-semibold">Leakage</th>
            <th className="border-b border-ink-100 px-3 pb-2 font-semibold">Severity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t, i) => (
            <motion.tr
              key={t.transactionId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              onClick={() => onInvestigate?.(t)}
              className="cursor-pointer transition-colors hover:bg-brand-50/60"
            >
              <td className="border-b border-ink-100 px-3 py-3">
                <div className="font-medium text-ink-800">{t.transactionId}</div>
                <div className="text-xs text-ink-400">
                  {t.product} · {formatDate(t.date)}
                </div>
              </td>
              <td className="border-b border-ink-100 px-3 py-3 text-ink-600">{t.supplier}</td>
              <td className="border-b border-ink-100 px-3 py-3">
                <DetectionBadge type={t.detectionType} />
              </td>
              <td className="tnum border-b border-ink-100 px-3 py-3 text-right text-ink-700">
                {formatINR(t.actualPrice)}
                <div className="text-[11px] text-ink-300">× {t.quantity} units</div>
              </td>
              <td className="tnum border-b border-ink-100 px-3 py-3 text-right text-ink-400">
                {formatINR(t.benchmarkPrice)}
              </td>
              <td className="tnum border-b border-ink-100 px-3 py-3 text-right font-semibold text-red-600">
                {formatCompactINR(t.potentialLeakage)}
              </td>
              <td className="border-b border-ink-100 px-3 py-3">
                <SeverityBadge severity={t.severity} />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
