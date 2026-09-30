// PriceVarianceChart.jsx — supplier price variance:
// how widely unit prices for comparable products vary by supplier.
// Data: [{ supplier, variancePct }] sorted descending.

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
import { AXIS_TICK, ChartTooltip, GRID_COLOR, SERIES_PURPLE } from "./chartTheme";

function varianceFormatter(v) {
  return `${v.toFixed(0)}%`;
}

export default function PriceVarianceChart({ data, height = 280 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 20, bottom: 0, left: 8 }}
          barCategoryGap="32%"
        >
          <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
          <XAxis
            type="number"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={varianceFormatter}
          />
          <YAxis
            type="category"
            dataKey="supplier"
            width={128}
            tick={{ ...AXIS_TICK, fill: "#a3aab5" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "rgba(139,124,246,0.06)" }}
            content={<ChartTooltip valueFormatter={varianceFormatter} />}
          />
          <Bar dataKey="variancePct" name="Price variance" radius={[0, 3, 3, 0]} maxBarSize={14}>
            {data.map((entry, i) => (
              <Cell
                key={entry.supplier}
                fill={SERIES_PURPLE}
                fillOpacity={i === 0 ? 1 : Math.max(0.35, 1 - i * 0.13)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
