import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getLeakage, getLeakageById } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { formatCompactINR, formatDate, formatINR } from "../utils/format";
import { DetectionBadge, SeverityBadge } from "../components/ui/Badges";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "../components/ui/States";
import { AlertIcon, SearchIcon } from "../components/ui/Icons";

/**
 * Investigation page — the "why was this flagged?" view.
 * Left: list of flagged transactions. Right: full reason + evidence for
 * the selected one. Deep-linkable via /investigation state from the
 * dashboard table, or via ?tx=TX1045 in the URL.
 */
export default function Investigation() {
  const location = useLocation();
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("");

  // If the dashboard table sent us here with a transactionId, select it.
  useEffect(() => {
    const fromState = location.state?.transactionId;
    const fromQuery = new URLSearchParams(window.location.search).get("tx");
    const id = fromState || fromQuery;
    if (id) setSelectedId(id);
  }, [location.state]);

  const leakageList = useFetch(getLeakage, []);
  const items = leakageList.data || [];

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (t) =>
        t.transactionId.toLowerCase().includes(q) ||
        t.supplier.toLowerCase().includes(q) ||
        t.product.toLowerCase().includes(q),
    );
  }, [items, filter]);

  // Lazily fetch detail for the selected record using the agreed detail endpoint.
  const detail = useFetch(
    () => (selectedId ? getLeakageById(selectedId) : Promise.resolve(null)),
    [selectedId],
  );

  if (leakageList.loading) return <LoadingPanel />;
  if (leakageList.error)
    return <ErrorPanel message={leakageList.error.message} onRetry={leakageList.refetch} />;

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Investigation</h1>
        <p className="mt-0.5 text-sm text-text-secondary">
          Review flagged transactions — reason, evidence and estimated impact
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        {/* ---------- Left: flagged list ---------- */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 rounded-control border border-border bg-surface px-3 py-2 text-small">
            <SearchIcon size={15} className="text-text-muted" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter flagged transactions…"
              className="w-full bg-transparent text-text-primary outline-none placeholder:text-text-muted"
            />
          </label>

          <div className="flex max-h-[560px] flex-col divide-y divide-border overflow-y-auto rounded-card border border-border bg-surface">
            {filtered.length === 0 && (
              <EmptyPanel message="No matching flagged transactions" />
            )}
            {filtered.map((t) => (
              <button
                key={t.transactionId}
                type="button"
                onClick={() => setSelectedId(t.transactionId)}
                className={`flex items-center justify-between gap-2 border-l-2 px-4 py-3 text-left transition ${
                  selectedId === t.transactionId
                    ? "border-accent bg-accent-soft"
                    : "border-transparent hover:bg-surface-hover"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">
                    {t.transactionId} · {t.product}
                  </p>
                  <p className="truncate text-xs text-text-muted">{t.supplier}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="tnum text-sm font-semibold text-red-600">
                    {formatCompactINR(t.potentialLeakage)}
                  </span>
                  <SeverityBadge severity={t.severity} size="sm" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ---------- Right: detail panel ---------- */}
        <div className="rounded-card border border-border bg-surface">
          {detail.loading && <LoadingPanel label="Loading evidence…" />}

          {detail.error && (
            <div className="p-5">
              <ErrorPanel message={detail.error.message} onRetry={detail.refetch} />
            </div>
          )}

          {!detail.loading && !detail.error && !detail.data && (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center gap-2 text-center">
              <span className="flex h-11 w-11 items-center justify-center rounded-control border border-border bg-background-2 text-text-muted">
                <SearchIcon size={20} />
              </span>
              <p className="font-medium text-text-primary">Select a transaction to investigate</p>
              <p className="max-w-xs text-sm text-text-secondary">
                Pick any flagged transaction to see the detection reason, price evidence and
                estimated financial impact.
              </p>
            </div>
          )}

          {!detail.loading && !detail.error && detail.data && (
            <div className="flex flex-col">
              {/* Detail header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                    Transaction
                  </p>
                  <p className="tnum text-lg font-semibold text-text-primary">
                    {detail.data.transactionId}
                  </p>
                  <p className="mt-0.5 text-sm text-text-secondary">
                    {detail.data.product} · {detail.data.supplier} ·{" "}
                    {detail.data.quantity} units
                    {detail.data.date ? ` · ${formatDate(detail.data.date)}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <DetectionBadge type={detail.data.detectionType} />
                  <SeverityBadge severity={detail.data.severity} size="md" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-3">
                <EvidenceStat
                  label="Actual unit price"
                  value={formatINR(detail.data.actualPrice)}
                  tone="danger"
                />
                <EvidenceStat
                  label="Benchmark unit price"
                  value={formatINR(detail.data.benchmarkPrice)}
                />
                <EvidenceStat
                  label="Potential leakage"
                  value={formatCompactINR(detail.data.potentialLeakage)}
                  tone="danger"
                  emphasis
                />
              </div>

              {/* Reason */}
              <div className="mx-5 mb-4 flex gap-3 rounded-control border border-amber-500/25 bg-amber-500/[0.08] p-4">
                <AlertIcon size={18} className="mt-0.5 shrink-0 text-amber-400" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-300/90">
                    Why this was flagged
                  </p>
                  <p className="mt-1 text-sm text-amber-100/90">{detail.data.reason}</p>
                </div>
              </div>

              {/* Calculation breakdown */}
              <div className="border-t border-border px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Impact calculation
                </p>
                <div className="tnum mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-text-secondary">
                  <span className="font-medium text-red-500">{formatINR(detail.data.actualPrice)}</span>
                  <span>actual −</span>
                  <span>{formatINR(detail.data.benchmarkPrice)} benchmark</span>
                  <span>=</span>
                  <span>
                    {formatINR(detail.data.actualPrice - detail.data.benchmarkPrice)} per unit
                  </span>
                  <span>×</span>
                  <span>{detail.data.quantity} units</span>
                  <span>=</span>
                  <span className="font-semibold text-red-500">
                    {formatINR(detail.data.potentialLeakage)} potential leakage
                  </span>
                </div>
                <p className="mt-3 text-xs text-text-muted">
                  Estimated from historical price benchmarks for this product category.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EvidenceStat({ label, value, tone, emphasis }) {
  return (
    <div
      className={`rounded-control border p-4 ${
        tone === "danger"
          ? "border-red-500/25 bg-red-500/[0.06]"
          : "border-border bg-background-2"
      }`}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>
      <p
        className={`tnum mt-1.5 ${emphasis ? "text-xl font-semibold" : "text-lg font-medium"} ${
          tone === "danger" ? "text-red-500" : "text-text-primary"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
