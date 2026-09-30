import { useMemo } from "react";
import { getLeakage } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { getLeakageTrend, groupLeakageBy, topGroups } from "../utils/aggregate";
import { formatCompactINR, formatNumber } from "../utils/format";
import SectionCard from "../components/dashboard/SectionCard";
import LeakageTrend from "../components/charts/LeakageTrend";
import { DETECTION_LABELS } from "../components/ui/Badges";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "../components/ui/States";

/**
 * Analytics — deeper cuts on the same leakage data:
 * detection-type mix and a supplier risk table.
 */
export default function Analytics() {
  const { data, loading, error, refetch } = useFetch(getLeakage, []);
  const items = data || [];

  const { byDetection, supplierRows } = useMemo(() => {
    const det = new Map();
    for (const t of items) {
      const cur = det.get(t.detectionType) || { name: t.detectionType, value: 0, count: 0 };
      cur.value += t.potentialLeakage;
      cur.count += 1;
      det.set(t.detectionType, cur);
    }

    // Supplier risk: total leakage, flag count, worst severity, share of total.
    const totalLeakage = items.reduce((s, t) => s + t.potentialLeakage, 0) || 1;
    const sup = groupLeakageBy(items, "supplier");
    const severityRank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const rows = sup.map((s) => {
      const flags = items.filter((t) => t.supplier === s.name);
      const worst = flags.reduce(
        (w, f) => (severityRank[f.severity] > severityRank[w] ? f.severity : w),
        "LOW",
      );
      return {
        supplier: s.name,
        leakage: s.value,
        flags: s.count,
        worstSeverity: worst,
        sharePct: (s.value / totalLeakage) * 100,
      };
    });
    rows.sort((a, b) => b.leakage - a.leakage);

    return { byDetection: [...det.values()], supplierRows: rows };
  }, [items]);

  if (loading) return <LoadingPanel />;
  if (error) return <ErrorPanel message={error.message} onRetry={refetch} />;
  if (items.length === 0) return <EmptyPanel message="No leakage data yet" />;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Analytics</h1>
        <p className="mt-0.5 text-sm text-ink-400">
          Deeper supplier and detection-type analysis
        </p>
      </div>

      {/* Detection-type mix */}
      <SectionCard
        title="Leakage by Detection Type"
        subtitle="Which pattern drives the most leakage"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {byDetection
            .sort((a, b) => b.value - a.value)
            .map((d) => (
              <div key={d.name} className="rounded-lg border border-ink-100 bg-ink-50/40 p-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                  {DETECTION_LABELS[d.name] || d.name}
                </p>
                <p className="tnum mt-1.5 text-xl font-semibold text-ink-900">
                  {formatCompactINR(d.value)}
                </p>
                <p className="tnum mt-0.5 text-xs text-ink-400">
                  {formatNumber(d.count)} transactions
                </p>
              </div>
            ))}
        </div>
      </SectionCard>

      <SectionCard title="Leakage Trend" subtitle="Monthly potential leakage">
        <LeakageTrend data={getLeakageTrend(items)} />
      </SectionCard>

      {/* Supplier risk table */}
      <SectionCard
        title="Supplier Risk Ranking"
        subtitle="Ranked by total potential leakage"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-[11px] uppercase tracking-wide text-ink-400">
                <th className="pb-2 pr-4 font-semibold">#</th>
                <th className="pb-2 pr-4 font-semibold">Supplier</th>
                <th className="pb-2 pr-4 font-semibold">Worst Severity</th>
                <th className="pb-2 pr-4 text-right font-semibold">Flags</th>
                <th className="pb-2 pr-4 text-right font-semibold">Leakage</th>
                <th className="pb-2 text-right font-semibold">Share</th>
              </tr>
            </thead>
            <tbody>
              {supplierRows.map((row, i) => (
                <tr key={row.supplier} className="border-b border-ink-100 last:border-0">
                  <td className="tnum py-3 pr-4 text-ink-400">{i + 1}</td>
                  <td className="py-3 pr-4 font-medium text-ink-800">{row.supplier}</td>
                  <td className="py-3 pr-4"><SeverityCell severity={row.worstSeverity} /></td>
                  <td className="tnum py-3 pr-4 text-right text-ink-600">{row.flags}</td>
                  <td className="tnum py-3 pr-4 text-right font-semibold text-red-600">
                    {formatCompactINR(row.leakage)}
                  </td>
                  <td className="py-3 pl-2">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-100">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${Math.min(100, row.sharePct)}%` }}
                        />
                      </div>
                      <span className="tnum w-10 text-right text-xs text-ink-500">
                        {row.sharePct.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function SeverityCell({ severity }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
        severity === "HIGH"
          ? "bg-red-50 text-red-700 ring-red-200"
          : severity === "MEDIUM"
            ? "bg-orange-50 text-orange-700 ring-orange-300"
            : "bg-amber-50 text-amber-700 ring-amber-200"
      }`}
    >
      {severity}
    </span>
  );
}
