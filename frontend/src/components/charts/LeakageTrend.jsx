import {
  Area,
  AreaChart,
  CartesianGrid,
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

/**
 * Leakage trend over time — monthly total potential leakage.
 * data: [{ month: "Sep 25", value, count }] (from getLeakageTrend).
 */
export default function LeakageTrend({ data, height = 260 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="leakageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={SERIES_BLUE} stopOpacity={0.25} />
              <stop offset="100%" stopColor={SERIES_BLUE} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={GRID_COLOR} />
          <XAxis
            dataKey="month"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={62}
            tickFormatter={(v) => formatCompactINR(v)}
          />
          <Tooltip content={<ChartTooltip valueFormatter={formatCompactINR} />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={SERIES_BLUE}
            strokeWidth={2}
            fill="url(#leakageGradient)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#11151c" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
