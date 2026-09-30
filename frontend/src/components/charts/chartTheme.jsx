// chartTheme.jsx — shared Recharts styling. Restrained and calm:
// thin hairline grids, one blue primary series, purple secondary only
// when necessary, red reserved for leakage/problem data.

export const AXIS_TICK = { fill: "#737b87", fontSize: 11 };
export const GRID_COLOR = "rgba(255, 255, 255, 0.05)";

export const SERIES_BLUE = "#4f7ff7";
export const SERIES_PURPLE = "#8a7cf0";
export const BAR_COLORS = ["#4f7ff7", "#658ff8", "#8a7cf0", "#58b8e8", "#3459ba", "#a5b8ff"];

/** Semantic exception colours (severity, movement). */
export const SEVERITY_COLORS = { LOW: "#3dbb72", MEDIUM: "#d9a92e", HIGH: "#d95c55" };
export const SPEND_COLOR = "#4f7ff7";
export const LEAKAGE_COLOR = "#d95c55";

/** Custom tooltip — dark panel, tabular numbers. */
export function ChartTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-control border border-border-strong bg-surface-elevated px-3 py-2.5 shadow-[var(--shadow-pop)]">
      {label !== undefined && (
        <p className="text-[11px] font-medium text-text-muted">{label}</p>
      )}
      {payload.map((row, i) => (
        <p key={i} className="tnum text-sm font-semibold" style={{ color: row.color || "#f4f7fa" }}>
          {row.name ? `${row.name}: ` : ""}
          {valueFormatter ? valueFormatter(row.value) : row.value}
        </p>
      ))}
      {payload[0]?.payload?.count !== undefined && (
        <p className="tnum mt-0.5 text-[11px] text-text-muted">
          {payload[0].payload.count} transaction{payload[0].payload.count === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
