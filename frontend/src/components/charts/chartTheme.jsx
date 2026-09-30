// chartTheme.js — shared Recharts styling so every chart looks identical.
// Change a colour here and all four charts update together.

export const AXIS_TICK = { fill: "#8a93a6", fontSize: 11 };
export const GRID_COLOR = "#eef0f4";
export const BAR_COLORS = ["#2748df", "#618df2", "#94b5f8", "#c0d3fb", "#3d66eb", "#1f37c4"];
export const SEVERITY_COLORS = { LOW: "#f59e0b", MEDIUM: "#f97316", HIGH: "#dc2626" };
export const LEAKAGE_AREA_FILL = "#2748df";
export const LEAKAGE_AREA_STROKE = "#1f37c4";

/** Custom tooltip — dark panel, tabular numbers, matches the app style. */
export function ChartTooltip({ active, payload, label, valueFormatter }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0];
  return (
    <div className="rounded-lg border border-ink-700 bg-ink-900/95 px-3 py-2 shadow-lg">
      <p className="text-[11px] font-medium text-ink-300">{label}</p>
      <p className="tnum text-sm font-semibold text-white">
        {valueFormatter ? valueFormatter(row.value) : row.value}
      </p>
      {row.payload?.count !== undefined && (
        <p className="tnum mt-0.5 text-[11px] text-ink-400">
          {row.payload.count} transaction{row.payload.count === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
