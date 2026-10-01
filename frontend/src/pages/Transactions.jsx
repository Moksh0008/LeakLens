import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getTransactions } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { formatCompactINR, formatDate, formatINR } from "../utils/format";
import { DetectionBadge, SeverityBadge } from "../components/ui/Badges";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "../components/ui/States";
import { SearchIcon } from "../components/ui/Icons";
import EmptyWorkspace from "../components/EmptyWorkspace";
import { IS_MOCK, hasMockData } from "../services/api";

const SEVERITIES = ["ALL", "HIGH", "MEDIUM", "LOW"];

export default function Transactions() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useFetch(getTransactions, []);
  // Header search lands here with ?q=… — seed the filter from it.
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [severity, setSeverity] = useState("ALL");

  const filtered = useMemo(() => {
    let rows = data || [];
    if (severity !== "ALL") rows = rows.filter((t) => t.severity === severity);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (t) =>
          t.transactionId.toLowerCase().includes(q) ||
          t.supplier.toLowerCase().includes(q) ||
          t.product.toLowerCase().includes(q),
      );
    }
    return rows;
  }, [data, query, severity]);

  if (loading) return <LoadingPanel />;
  if (error) return <ErrorPanel message={error.message} onRetry={refetch} />;

  // No content until a CSV has been imported (mock flag or empty DB).
  const workspaceEmpty = IS_MOCK ? !hasMockData() : (data || []).length === 0;
  if (workspaceEmpty) return <EmptyWorkspace />;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Transactions</h1>
        <p className="mt-0.5 text-sm text-ink-400">
          All {data.length.toLocaleString("en-IN")} analyzed procurement records
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex flex-1 items-center gap-2 rounded-control border border-border bg-surface px-3 py-2 text-small lg:max-w-xs">
          <SearchIcon size={15} className="text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ID, supplier, product…"
            className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted"
          />
        </label>
        <div className="flex gap-1 rounded-control border border-border bg-surface p-1">
          {SEVERITIES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSeverity(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                severity === s ? "bg-accent text-white" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="tnum ml-auto text-xs text-ink-400">
          {filtered.length.toLocaleString("en-IN")} rows
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyPanel message="No transactions match your filters" hint="Try clearing the search or severity filter" />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-[11px] uppercase tracking-wide text-ink-400">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">Supplier</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 text-right font-semibold">Unit Price</th>
                <th className="px-4 py-3 text-right font-semibold">Leakage</th>
                <th className="px-4 py-3 font-semibold">Detection</th>
                <th className="px-4 py-3 font-semibold">Severity</th>
              </tr>
            </thead>
            <tbody>
              {/* Flagged rows open the Investigation view (flagged list +
                  evidence) for that transaction; Clean rows are read-only —
                  there is nothing to investigate on them. */}
              {filtered.slice(0, 100).map((t) => (
                <tr
                  key={t.transactionId}
                  onClick={() =>
                    t.potentialLeakage > 0 &&
                    navigate("/investigation", { state: { transactionId: t.transactionId } })
                  }
                  className={`border-b border-ink-100 last:border-0 transition-colors ${
                    t.potentialLeakage > 0
                      ? "cursor-pointer hover:bg-surface-hover/40"
                      : "hover:bg-surface-hover/20"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-ink-800">{t.transactionId}</td>
                  <td className="px-4 py-3 text-ink-600">{t.product}</td>
                  <td className="px-4 py-3 text-ink-600">{t.supplier}</td>
                  <td className="px-4 py-3 text-ink-500">{formatDate(t.date)}</td>
                  <td className="tnum px-4 py-3 text-right text-ink-700">{formatINR(t.actualPrice)}</td>
                  <td className="tnum px-4 py-3 text-right font-medium text-red-600">
                    {t.potentialLeakage > 0 ? formatCompactINR(t.potentialLeakage) : "—"}
                  </td>
                  <td className="px-4 py-3"><DetectionBadge type={t.detectionType} /></td>
                  <td className="px-4 py-3"><SeverityBadge severity={t.severity} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 100 && (
            <p className="px-4 py-3 text-xs text-ink-400">
              Showing first 100 of {filtered.length.toLocaleString("en-IN")} — refine filters to narrow down.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
