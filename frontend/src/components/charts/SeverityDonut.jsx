import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip, SEVERITY_COLORS } from "./chartTheme";
import { formatCompactINR, formatNumber } from "../../utils/format";

/**
 * Severity distribution donut.
 * data: [{ name: "LOW"|"MEDIUM"|"HIGH", value, count }] (from getSeverityDistribution).
 * Value = leakage amount per severity; center shows total leakage.
 */
export default function SeverityDonut({ data, height = 240 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const totalFlags = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="flex h-full flex-col sm:flex-row sm:items-center">
      <div style={{ height }} className="relative w-full sm:w-1/2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={2}
              strokeWidth={2}
              stroke="#11151c"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={SEVERITY_COLORS[entry.name] || "#8a93a6"}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip valueFormatter={formatCompactINR} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="overline">Total leakage</span>
          <span className="tnum text-xl font-semibold text-text-primary">
            {formatCompactINR(total)}
          </span>
          <span className="tnum text-[11px] text-text-muted">
            {formatNumber(totalFlags)} flags
          </span>
        </div>
      </div>

      <ul className="mt-4 flex flex-col gap-2.5 sm:mt-0 sm:w-1/2 sm:pl-4">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: SEVERITY_COLORS[d.name] }}
              />
              <span className="font-medium text-text-primary">{d.name}</span>
            </span>
            <span className="tnum text-text-secondary">
              {formatCompactINR(d.value)}{" "}
              <span className="text-text-muted">· {d.count}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
