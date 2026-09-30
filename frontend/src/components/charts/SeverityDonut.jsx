import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip, SEVERITY_COLORS } from "./chartTheme";
import { formatCompactINR, formatNumber } from "../../utils/format";

/**
 * Severity distribution donut — calm and compact.
 * Left: modest ring with the total in the center. Right: a neatly
 * aligned legend with small semantic indicators.
 */
export default function SeverityDonut({ data, height = 210 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const totalFlags = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex h-full flex-col items-center gap-6 sm:flex-row">
      <div style={{ height }} className="relative w-full max-w-[220px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="92%"
              paddingAngle={3}
              cornerRadius={3}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={SEVERITY_COLORS[entry.name] || "#737b87"}
                  fillOpacity={0.9}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip valueFormatter={formatCompactINR} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-caption text-text-muted">Total leakage</span>
          <span className="tnum mt-0.5 text-xl font-semibold text-text-primary">
            {formatCompactINR(total)}
          </span>
          <span className="tnum mt-0.5 text-caption text-text-muted">
            {formatNumber(totalFlags)} flags
          </span>
        </div>
      </div>

      {/* Legend — aligned rows, small semantic dots, quiet numbers */}
      <ul className="flex w-full flex-col gap-3.5">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-4 text-small">
            <span className="flex items-center gap-2.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: SEVERITY_COLORS[d.name] }}
              />
              <span className="text-text-secondary">{d.name}</span>
            </span>
            <span className="tnum text-text-primary">{formatCompactINR(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
