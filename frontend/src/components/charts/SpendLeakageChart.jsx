// SpendLeakageChart.jsx — the primary analytical chart:
// monthly procurement spend (blue bars, left axis) vs potential leakage
// (red line + soft gradient area, right axis).

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
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
  SPEND_COLOR,
} from "./chartTheme";
import { formatCompactINR } from "../../utils/format";

export default function SpendLeakageChart({ data, height = 300 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="spendBarFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SPEND_COLOR} stopOpacity={0.85} />
              <stop offset="100%" stopColor={SPEND_COLOR} stopOpacity={0.35} />
            </linearGradient>
            <linearGradient id="leakAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={LEAKAGE_COLOR} stopOpacity={0.26} />
              <stop offset="100%" stopColor={LEAKAGE_COLOR} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID_COLOR} vertical={false} />
          <XAxis dataKey="month" tick={AXIS_TICK} tickLine={false} axisLine={false} dy={8} />
          <YAxis
            yAxisId="spend"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={64}
            tickFormatter={(v) => formatCompactINR(v)}
          />
          <YAxis
            yAxisId="leakage"
            orientation="right"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={64}
            tickFormatter={(v) => formatCompactINR(v)}
          />
          <Tooltip
            cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
            content={<ChartTooltip valueFormatter={formatCompactINR} />}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 6 }}
          />
          <Bar
            yAxisId="spend"
            dataKey="spend"
            name="Procurement Spend"
            fill="url(#spendBarFill)"
            radius={[4, 4, 0, 0]}
            maxBarSize={34}
          />
          <Area
            yAxisId="leakage"
            type="monotone"
            dataKey="leakage"
            name="Potential Leakage"
            legendType="none"
            stroke="none"
            fill="url(#leakAreaFill)"
          />
          <Line
            yAxisId="leakage"
            type="monotone"
            dataKey="leakage"
            name="Potential Leakage"
            stroke={LEAKAGE_COLOR}
            strokeWidth={2.2}
            dot={{ r: 3, fill: LEAKAGE_COLOR, strokeWidth: 0 }}
            activeDot={{ r: 5, stroke: "#11151c", strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
