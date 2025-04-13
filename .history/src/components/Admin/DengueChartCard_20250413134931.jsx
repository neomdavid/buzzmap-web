import React, { PureComponent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ✅ Dengue cases per month
const data = [
  { month: "Jan", cases: 120 },
  { month: "Feb", cases: 210 },
  { month: "Mar", cases: 320 },
  { month: "Apr", cases: 280 },
  { month: "May", cases: 390 },
  { month: "Jun", cases: 450 },
  { month: "Jul", cases: 300 },
  { month: "Aug", cases: 250 },
  { month: "Sep", cases: 310 },
  { month: "Oct", cases: 200 },
  { month: "Nov", cases: 170 },
  { month: "Dec", cases: 140 },
];

class CustomizedLabel extends PureComponent {
  render() {
    const { x, y, value } = this.props;

    return (
      <text
        x={x}
        y={y}
        dy={-11}
        fill="#fff" // ✅ Label text white
        fontSize={10}
        textAnchor="middle"
      >
        {value}
      </text>
    );
  }
}

class CustomizedAxisTick extends PureComponent {
  render() {
    const { x, y, payload } = this.props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#fff" // ✅ X-axis tick label white
          transform="rotate(-35)"
        >
          {payload.value}
        </text>
      </g>
    );
  }
}

export default function DengueChartCard() {
  return (
    <div className="w-full bg-primary p-6 py-10  rounded-sm">
      <p className="text-2xl text-center font-semibold mb-4 text-white">
        Monthly Dengue Cases (2024)
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 15, left: -25, bottom: 13 }}
        >
          <CartesianGrid strokeDasharray="0 0" vertical={false} />
          <XAxis
            dataKey="month"
            height={60}
            tick={<CustomizedAxisTick />}
            stroke="#fff" // ✅ X-axis line white
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            stroke="#fff" // ✅ Y-axis line white
            tick={{ fill: "#fff" }} // ✅ Y-axis tick labels white
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
          />
          <Legend
            formatter={() => "Number of Cases"}
            wrapperStyle={{ color: "#fff" }} // ✅ Legend label white
          />
          <Line
            type="monotone"
            dataKey="cases"
            stroke="var(--color-error)"
            strokeWidth={3}
            dot={{
              r: 5,
              stroke: "var(--color-error)",
              strokeWidth: 2,
              fill: "var(--color-error)", // ✅ red dot fill
            }}
            activeDot={{
              r: 7,
              stroke: "var(--color-error)",
              strokeWidth: 2,
              fill: "var(--color-error)", // ✅ red active dot fill
            }}
            label={<CustomizedLabel />}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
