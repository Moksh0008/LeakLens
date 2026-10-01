import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getTransactions } from "../services/api";
import { useFetch } from "../hooks/useFetch";
import { formatCompactINR, formatDate, formatINR } from "../utils/format";
import { DetectionBadge, SeverityBadge } from "../components/ui/Badges";
import { EmptyPanel, ErrorPanel, LoadingPanel } from "../components/ui/States";
import { FilterIcon, SearchIcon } from "../components/ui/Icons";
import EmptyWorkspace from "../components/EmptyWorkspace";
import { IS_MOCK, hasMockData } from "../services/api";

const SEVERITIES = ["ALL", "HIGH", "MEDIUM", "LOW"];

const DETECTION_OPTIONS = [
  { value: "ALL", label: "All detections" },
  { value: "PRICE_ANOMALY", label: "Price Anomaly" },
  { value: "POSSIBLE_DUPLICATE", label: "Possible Duplicate" },
  { value: "CLEAN", label: "Clean only" },
];

// Ascending severity rank = worst findings first.
const SEVERITY_RANK = { HIGH: 0, MEDIUM: 1, LOW: 2 };

/** Grouped filter options inside the Filters panel. */
function FilterSection({ label, children }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function OptionPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${
        active
          ? "border-accent bg-accent text-white"
          : "border-border text-text-secondary hover:border-accent/50 hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

/** Highlighted column header — click to sort by that column. */
function SortableTh({ label, colKey, defaultDir = "asc", align = "left", sort, onSort }) {
  const active = sort.key === colKey;
  return (
    <th className={`px-4 py-3 ${align === "right" ? "text-right" : ""}`}>
      <button
        type="button"
        onClick={() => onSort(colKey, defaultDir)}
        className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide transition ${
          active ? "text-accent" : "text-accent/70 hover:text-accent"
        }`}
      >
        {label}
        <span aria-hidden className="text-[8px] leading-none opacity-60">
          {active ? (sort.dir === "asc" ? "▲" : "▼") : "⇅"}
        </span>
      </button>
    </th>
  );
}

export default function Transactions() {
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useFetch(getTransactions, []);
  // Header search lands here with ?q=… — seed the filter from it.
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [severity, setSeverity] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [supplier, setSupplier] = useState("ALL");
  const [detection, setDetection] = useState("ALL");
  const [sort, setSort] = useState({ key: "date", dir: "desc" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtersRef = useRef(null);

  // Close the Filters panel when clicking anywhere outside it.
  useEffect(() => {
    if (!filtersOpen) return undefined;
    const onPointerDown = (e) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target)) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [filtersOpen]);

  const categories = useMemo(
    () => [...new Set((data || []).map((t) => t.category))].sort(),
    [data],
  );
  const suppliers = useMemo(
    () => [...new Set((data || []).map((t) => t.supplier))].sort(),
    [data],
  );

  const filtered = useMemo(() => {
    let rows = data || [];
    if (severity !== "ALL") rows = rows.filter((t) => t.severity === severity);
    if (category !== "ALL") rows = rows.filter((t) => t.category === category);
    if (supplier !== "ALL") rows = rows.filter((t) => t.supplier === supplier);
    if (detection !== "ALL") {
      rows = rows.filter((t) =>
        detection === "CLEAN"
          ? t.detectionType === "NONE"
          : t.detectionType === detection,
      );
    }
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (t) =>
          t.transactionId.toLowerCase().includes(q) ||
          t.supplier.toLowerCase().includes(q) ||
          t.product.toLowerCase().includes(q),
      );
    }

    const val = (t) => {
      switch (sort.key) {
        case "unitPrice":
          return t.actualPrice ?? t.unitPrice ?? 0;
        case "leakage":
          return t.potentialLeakage ?? 0;
        case "severity":
          return SEVERITY_RANK[t.severity] ?? 9;
        default:
          return t[sort.key];
      }
    };
    return [...rows].sort((a, b) => {
      const va = val(a);
      const vb = val(b);
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [data, query, severity, category, supplier, detection, sort]);

  const activeCount =
    (severity !== "ALL" ? 1 : 0) +
    (category !== "ALL" ? 1 : 0) +
    (supplier !== "ALL" ? 1 : 0) +
    (detection !== "ALL" ? 1 : 0) +
    (query.trim() !== "" ? 1 : 0);

  const resetFilters = () => {
    setQuery("");
    setSeverity("ALL");
    setCategory("ALL");
    setSupplier("ALL");
    setDetection("ALL");
  };

  const toggleSort = (key, defaultDir = "asc") =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: defaultDir },
    );

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

      {/* Search + Filters trigger */}
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
        <div className="relative" ref={filtersRef}>
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
            {activeCount > 0 && (
              <span className="tnum rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white ring-2 ring-surface">
                {activeCount}
              </span>
            )}
          </button>

          {filtersOpen && (
            <div className="absolute right-0 z-20 mt-2 w-[300px] rounded-card border border-border bg-surface p-4 shadow-xl shadow-black/30">
              <p className="mb-3 text-sm font-semibold text-ink-900">Filters</p>
              <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto pr-1">
                <FilterSection label="Severity">
                  {SEVERITIES.map((s) => (
                    <OptionPill
                      key={s}
                      active={severity === s}
                      onClick={() => setSeverity(s)}
                    >
                      {s === "ALL" ? "All" : s}
                    </OptionPill>
                  ))}
                </FilterSection>
                <FilterSection label="Category">
                  <OptionPill active={category === "ALL"} onClick={() => setCategory("ALL")}>
                    All
                  </OptionPill>
                  {categories.map((c) => (
                    <OptionPill key={c} active={category === c} onClick={() => setCategory(c)}>
                      {c}
                    </OptionPill>
                  ))}
                </FilterSection>
                <FilterSection label="Supplier">
                  <OptionPill active={supplier === "ALL"} onClick={() => setSupplier("ALL")}>
                    All
                  </OptionPill>
                  {suppliers.map((s) => (
                    <OptionPill key={s} active={supplier === s} onClick={() => setSupplier(s)}>
                      {s}
                    </OptionPill>
                  ))}
                </FilterSection>
                <FilterSection label="Detection">
                  {DETECTION_OPTIONS.map((o) => (
                    <OptionPill
                      key={o.value}
                      active={detection === o.value}
                      onClick={() => setDetection(o.value)}
                    >
                      {o.value === "ALL" ? "All" : o.label}
                    </OptionPill>
                  ))}
                </FilterSection>
              </div>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-4 w-full rounded-control border border-border py-2 text-xs font-medium text-text-secondary transition hover:border-red-500/40 hover:text-red-500"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
        <span className="tnum text-xs text-ink-400">
          {filtered.length.toLocaleString("en-IN")} rows
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyPanel message="No transactions match your filters" hint="Try a different search, or press Clear filters" />
      ) : (
        <div className="overflow-x-auto rounded-card border border-border bg-surface">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-accent/[0.05] text-[11px] uppercase tracking-wide">
                <SortableTh label="ID" colKey="transactionId" sort={sort} onSort={toggleSort} />
                <SortableTh label="Product" colKey="product" sort={sort} onSort={toggleSort} />
                <SortableTh label="Supplier" colKey="supplier" sort={sort} onSort={toggleSort} />
                <SortableTh label="Date" colKey="date" defaultDir="desc" sort={sort} onSort={toggleSort} />
                <SortableTh label="Unit Price" colKey="unitPrice" defaultDir="desc" align="right" sort={sort} onSort={toggleSort} />
                <SortableTh label="Leakage" colKey="leakage" defaultDir="desc" align="right" sort={sort} onSort={toggleSort} />
                <th className="px-4 py-3 font-semibold text-accent/70">Detection</th>
                <SortableTh label="Severity" colKey="severity" defaultDir="asc" sort={sort} onSort={toggleSort} />
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
