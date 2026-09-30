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
 * dashboard/transactions tables, or via ?tx=TX1045 in the URL.
 *
 * Styling follows the dark design system: surface panels, token colors,
 * danger tint reserved for leakage figures, warning tint for the reason.
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
    <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-heading font-semibold text-text-primary">Investigation</h1>
        <p className="mt-1 text-body text-text-secondary">
          Review flagged transactions — reason, evidence and estimated impact
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        {/* ---------- Left: flagged list ---------- */}
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2.5 rounded-control border border-border bg-surface px-3.5 py-2.5 text-small transition-colors focus-within:border-border-strong">
            <SearchIcon size={15} className="shrink-0 text-text-muted" />
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
            {filtered.map((t) => {
              const active = selectedId === t.transactionId;
              return (
                <button
                  key={t.transactionId}
                  type="button"
                  onClick={() => setSelectedId(t.transactionId)}
                  aria-current={active ? "true" : undefined}
                  className={`relative flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 ${
                    active
                      ? "bg-accent-soft"
                      : "hover:bg-surface-hover"
                  }`}
                >
                  {/* quiet active indicator, mirroring the sidebar */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent transition-opacity ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div className="min-w-0">
                    <p
                      className={`tnum truncate text-small font-medium ${
                        active ? "text-text-primary" : "text-text-secondary"
                      }`}
                    >
                      {t.transactionId} · {t.product}
                    </p>
                    <p className="truncate text-caption text-text-muted">{t.supplier}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="tnum text-small font-semibold text-danger">
                      {formatCompactINR(t.potentialLeakage)}
                    </span>
                    <SeverityBadge severity={t.severity} size="sm" />
                  </div>
                </button>
              );
            })}
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
              <SearchIcon size={26} className="text-text-muted" />
              <p className="font-medium text-text-primary">Select a transaction to investigate</p>
              <p className="max-w-xs text-small text-text-secondary">
                Pick any flagged transaction to see the detection reason, price evidence and
                estimated financial impact.
              </p>
            </div>
          )}

          {!detail.loading && !detail.error && detail.data && (
            <div className="flex flex-col">
              {/* Detail header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-6 py-5">
                <div>
                  <p className="overline">Transaction</p>
                  <p className="tnum mt-1 text-heading font-semibold leading-tight text-text-primary">
                    {detail.data.transactionId}
                  </p>
                  <p className="mt-1 text-small text-text-secondary">
                    {detail.data.product} · {detail.data.supplier} · {formatDate(detail.data.date)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <DetectionBadge type={detail.data.detectionType} />
                  <SeverityBadge severity={detail.data.severity} size="md" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-3">
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

              {/* Reason — dark warning panel, amber kept to tint + text */}
              <div className="mx-6 mb-5 flex gap-3 rounded-control border border-warning/25 bg-warning/8 p-4">
                <AlertIcon size={18} className="mt-0.5 shrink-0 text-warning" />
                <div>
                  <p className="overline text-warning">Why this was flagged</p>
                  <p className="mt-1 text-small leading-relaxed text-text-secondary">
                    {detail.data.reason}
                  </p>
                </div>
              </div>

              {/* Calculation breakdown */}
              <div className="border-t border-border px-6 py-5">
                <p className="overline">Impact calculation</p>
                <div className="tnum mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-text-secondary">
                  <span className="font-medium text-danger">
                    {formatINR(detail.data.actualPrice)}
                  </span>
                  <span className="text-text-muted">actual −</span>
                  <span className="text-text-primary">{formatINR(detail.data.benchmarkPrice)}</span>
                  <span className="text-text-muted">benchmark =</span>
                  <span className="text-text-primary">
                    {formatINR(detail.data.actualPrice - detail.data.benchmarkPrice)}
                  </span>
                  <span className="text-text-muted">per unit ×</span>
                  <span className="text-text-primary">{detail.data.quantity}</span>
                  <span className="text-text-muted">units =</span>
                  <span className="font-semibold text-danger">
                    {formatINR(detail.data.potentialLeakage)} potential leakage
                  </span>
                </div>
                <p className="mt-3 text-caption text-text-muted">
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
  const isDanger = tone === "danger";
  return (
    <div
      className={`rounded-control border p-4 ${
        isDanger ? "border-danger/20 bg-danger/8" : "border-border bg-surface-elevated/60"
      }`}
    >
      <p className="overline">{label}</p>
      <p
        className={`tnum mt-2 leading-none ${
          emphasis ? "text-[22px] font-semibold" : "text-[17px] font-medium"
        } ${isDanger ? "text-danger" : "text-text-primary"}`}
      >
        {value}
      </p>
    </div>
  );
}
