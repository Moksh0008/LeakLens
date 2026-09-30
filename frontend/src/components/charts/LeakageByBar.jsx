import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AXIS_TICK,
  BAR_COLORS,
  ChartTooltip,
  GRID_COLOR,
} from "./chartTheme";
import { formatCompactINR } from "../../utils/format";

/**
 * Horizontal bar chart — "Where is money leaking?"
 * Used for Leakage by Supplier and Leakage by Category.
 * data: [{ name, value, count }] sorted by value desc.
 */
export default function LeakageByBar({ data, height = 280 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 24, bottom: 0, left: 8 }}
          barCategoryGap="22%"
        >
          <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
          <XAxis
            type="number"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => formatCompactINR(v)}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ ...AXIS_TICK, fill: "#414a58" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(39,72,223,0.04)" }}
            content={<ChartTooltip valueFormatter={formatCompactINR} />}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
