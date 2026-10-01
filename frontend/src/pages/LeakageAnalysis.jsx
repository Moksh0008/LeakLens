// LeakageAnalysis.jsx — every leakage alert in one place.
// Replaces the old sidebar "Leakage alerts" card and the module placeholder:
// alert summary stats, severity/detection triage, and the full alert feed.
// Clicking an alert drills into /investigation for the evidence trail.

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLeakage } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { formatCompactINR, formatINR } from "../utils/format";
import { DetectionBadge, SeverityBadge } from "../components/ui/Badges";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "../components/ui/States";
import { ChevronDownIcon, FilterIcon, SearchIcon } from "../components/ui/Icons";
import EmptyWorkspace from "../components/EmptyWorkspace";
import { IS_MOCK, hasMockData } from "../services/api";

const SEVERITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

const DETECTION_LABELS = {
  PRICE_ANOMALY: "Price Anomaly",
  POSSIBLE_DUPLICATE: "Possible Duplicate",
};

export default function LeakageAnalysis() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useFetch(getLeakage, []);
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("ALL");
  const [detection, setDetection] = useState("ALL");
  const [sort, setSort] = useState("impact");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const alerts = useMemo(() => data || [], [data]);

  const stats = useMemo(() => {
    const bySeverity = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    const byDetection = {};
    let impact = 0;
    for (const a of alerts) {
      bySeverity[a.severity] = (bySeverity[a.severity] || 0) + 1;
      byDetection[a.detectionType] = (byDetection[a.detectionType] || 0) + 1;
      impact += a.potentialLeakage ?? 0;
    }
    return { bySeverity, byDetection, impact };
  }, [alerts]);

  const detectionTypes = useMemo(
    () => Object.keys(stats.byDetection),
    [stats],
  );

  const filtered = useMemo(() => {
    let rows = [...alerts];
    if (severity !== "ALL") rows = rows.filter((a) => a.severity === severity);
    if (detection !== "ALL") rows = rows.filter((a) => a.detectionType === detection);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (a) =>
          a.transactionId.toLowerCase().includes(q) ||
          a.supplier.toLowerCase().includes(q) ||
          a.product.toLowerCase().includes(q),
      );
    }
    rows.sort((a, b) => {
      if (sort === "impact") return (b.potentialLeakage ?? 0) - (a.potentialLeakage ?? 0);
      if (sort === "severity")
        return (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
      return a.transactionId.localeCompare(b.transactionId);
    });
    return rows;
  }, [alerts, severity, detection, query, sort]);

  if (loading) return <LoadingPanel label="Loading leakage alerts…" />;
  if (error) return <ErrorPanel message={error.message} onRetry={refetch} />;

  const workspaceEmpty = IS_MOCK ? !hasMockData() : alerts.length === 0;
  if (workspaceEmpty) return <EmptyWorkspace />;

  const activeFilters =
    (severity !== "ALL" ? 1 : 0) +
    (detection !== "ALL" ? 1 : 0) +
    (query.trim() !== "" ? 1 : 0);

  return (
    <div className="mx-auto flex max-w-[1400px] flex-col gap-5">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Leakage Analysis</h1>
        <p className="mt-0.5 text-sm text-ink-400">
          All leakage alerts — triage by severity and detection type, then
          investigate
        </p>
      </div>

      {/* Alert summary — the old sidebar card's numbers, promoted to the page */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-caption text-ink-400">Open alerts</p>
          <p className="tnum mt-1 text-2xl font-semibold text-text-primary">
            {alerts.length.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-caption text-ink-400">Estimated impact</p>
          <p className="tnum mt-1 text-2xl font-semibold text-red-600">
            {formatCompactINR(stats.impact)}
          </p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-caption text-ink-400">High / Medium</p>
          <p className="tnum mt-1 text-2xl font-semibold text-text-primary">
            {stats.bySeverity.HIGH}
            <span className="text-base text-ink-400"> / </span>
            {stats.bySeverity.MEDIUM}
          </p>
        </div>
        <div className="rounded-card border border-border bg-surface p-4">
          <p className="text-caption text-ink-400">Detection types</p>
          <p className="tnum mt-1 text-2xl font-semibold text-text-primary">
            {detectionTypes.length}
          </p>
        </div>
      </div>

      {/* Toolbar: search + Filters panel + sort */}
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

        <div className="relative">
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className={`flex items-center gap-2 rounded-control border px-3.5 py-2 text-small font-medium transition ${
              filtersOpen
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-text-primary hover:border-accent/50"
            }`}
          >
            <FilterIcon size={15} />
            Filters
            {activeFilters > 0 && (
              <span className="tnum rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white ring-2 ring-surface">
                {activeFilters}
              </span>
            )}
          </button>

          {filtersOpen && (
            <div className="absolute right-0 z-20 mt-2 w-[280px] rounded-card border border-border bg-surface p-4 shadow-xl shadow-black/30">
              <p className="mb-3 text-sm font-semibold text-text-primary">Filters</p>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    Severity
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {["ALL", "HIGH", "MEDIUM", "LOW"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSeverity(s)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                          severity === s
                            ? "border-accent bg-accent text-white"
                            : "border-border text-text-secondary hover:border-accent/50 hover:text-text-primary"
                        }`}
                      >
                        {s === "ALL" ? "All" : s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
                    Detection
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDetection("ALL")}
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                        detection === "ALL"
                          ? "border-accent bg-accent text-white"
                          : "border-border text-text-secondary hover:border-accent/50 hover:text-text-primary"
                      }`}
                    >
                      All
                    </button>
                    {detectionTypes.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDetection(d)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
                          detection === d
                            ? "border-accent bg-accent text-white"
                            : "border-border text-text-secondary hover:border-accent/50 hover:text-text-primary"
                        }`}
                      >
                        {DETECTION_LABELS[d] || d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSeverity("ALL");
                  setDetection("ALL");
                  setQuery("");
                }}
                className="mt-4 w-full rounded-control border border-border py-2 text-xs font-medium text-text-secondary transition hover:border-red-500/40 hover:text-red-500"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <select
            aria-label="Sort alerts"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none rounded-control border border-border bg-surface py-2 pl-3 pr-8 text-small text-text-primary outline-none transition focus:border-accent"
          >
            <option value="impact">Highest impact</option>
            <option value="severity">By severity</option>
            <option value="id">By transaction ID</option>
          </select>
          <ChevronDownIcon
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
        </div>

        <span className="tnum ml-auto text-xs text-ink-400">
          {filtered.length.toLocaleString("en-IN")} alerts
        </span>
      </div>

      {/* Alert feed */}
      {filtered.length === 0 ? (
        <EmptyPanel
          message="No alerts match your filters"
          hint="Try a different search, or press Clear filters"
        />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-accent/[0.05] text-[11px] uppercase tracking-wide">
                <th className="px-4 py-3 font-semibold text-accent/70">Alert</th>
                <th className="px-4 py-3 font-semibold text-accent/70">Product</th>
                <th className="px-4 py-3 font-semibold text-accent/70">Supplier</th>
                <th className="px-4 py-3 text-right font-semibold text-accent/70">Actual vs Benchmark</th>
                <th className="px-4 py-3 text-right font-semibold text-accent/70">Impact</th>
                <th className="px-4 py-3 font-semibold text-accent/70">Detection</th>
                <th className="px-4 py-3 font-semibold text-accent/70">Severity</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr
                  key={a.transactionId}
                  onClick={() =>
                    navigate("/investigation", {
                      state: { transactionId: a.transactionId },
                    })
                  }
                  className="cursor-pointer border-b border-ink-100 transition-colors last:border-0 hover:bg-surface-hover/40"
                >
                  <td className="px-4 py-3 font-medium text-ink-800">
                    {a.transactionId}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{a.product}</td>
                  <td className="px-4 py-3 text-ink-600">{a.supplier}</td>
                  <td className="tnum px-4 py-3 text-right text-ink-600">
                    {formatINR(a.actualPrice)} <span className="text-ink-400">vs</span>{" "}
                    {formatINR(a.benchmarkPrice)}
                  </td>
                  <td className="tnum px-4 py-3 text-right font-medium text-red-600">
                    {formatCompactINR(a.potentialLeakage)}
                  </td>
                  <td className="px-4 py-3">
                    <DetectionBadge type={a.detectionType} />
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={a.severity} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
