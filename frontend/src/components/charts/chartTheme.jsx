// chartTheme.jsx — shared Recharts styling for the dark financial theme.
// Blue = primary series, purple = secondary series. Green/yellow/red are
// reserved for semantic exceptions (severity, positive/negative movement).

export const AXIS_TICK = { fill: "#707988", fontSize: 11 };
export const GRID_COLOR = "#242a34";

/** Primary series ramp — blue, with purple as the secondary accent. */
export const SERIES_BLUE = "#3b82f6";
export const SERIES_PURPLE = "#8b7cf6";
export const BAR_COLORS = [
  "#3b82f6",
  "#5d9bff",
  "#8b7cf6",
  "#38bdf8",
  "#2559be",
  "#a5b8ff",
];

/** Semantic exception colours (severity, movement). */
export const SEVERITY_COLORS = { LOW: "#22c55e", MEDIUM: "#eab308", HIGH: "#ef4444" };
export const SPEND_COLOR = "#3b82f6";
export const LEAKAGE_COLOR = "#ef4444";

/** Custom tooltip — dark panel, tabular numbers. */
export function ChartTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-border-strong bg-surface-elevated px-3 py-2 shadow-[var(--shadow-pop)]">
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
