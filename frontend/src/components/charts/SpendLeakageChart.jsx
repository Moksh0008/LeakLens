// SpendLeakageChart.jsx — the primary analytical chart:
// procurement spend (blue area) vs potential leakage (red line) per month.

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AXIS_TICK,
  ChartTooltip,
  GRID_COLOR,
  LEAKAGE_COLOR,
  SERIES_BLUE,
} from "./chartTheme";
import { formatCompactINR } from "../../utils/format";

export default function SpendLeakageChart({ data, height = 300 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES_BLUE} stopOpacity={0.28} />
              <stop offset="100%" stopColor={SERIES_BLUE} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="month" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={60}
            tickFormatter={(v) => formatCompactINR(v)}
          />
          <Tooltip
            cursor={{ stroke: "#303744", strokeDasharray: "3 3" }}
            content={<ChartTooltip valueFormatter={formatCompactINR} />}
          />
          <Area
            type="monotone"
            dataKey="spend"
            name="Spend"
            stroke={SERIES_BLUE}
            strokeWidth={2}
            fill="url(#spendFill)"
            activeDot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="leakage"
            name="Potential Leakage"
            stroke={LEAKAGE_COLOR}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
