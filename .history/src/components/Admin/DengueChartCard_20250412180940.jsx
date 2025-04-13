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
    const { x, y, stroke, value } = this.props;

    return (
      <text
        x={x}
        y={y}
        dy={-11}
        fill="#fff" // ✅ force label to be white
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
          fill="#fff" // ✅ changed to white
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
    <div className="w-full bg-primary max-w-4xl mx-auto p-4 rounded-sm">
      <p className="text-2xl text-center font-semibold mb-4 text-white">
        Monthly Dengue Cases (2024)
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ left: -30, bottom: 10 }}>
          <CartesianGrid strokeDasharray="0 0" vertical={false} />
          <XAxis
            dataKey="month"
            height={60}
            tick={<CustomizedAxisTick />}
            stroke="#fff" // ✅ axis line white
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            stroke="#fff" // ✅ Y axis line white
            tick={{ fill: "#fff" }} // ✅ tick values white (if no custom tick used)
          />

          <YAxis axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-base-200)",
              border: "1px solid hsl(var(--border))",
              color: "var(--color-primary)", // ✅ Change the tooltip text color to white
            }}
            itemStyle={{
              color: "var(--color-primary)", // ✅ Make the text (cases) white as well
            }}
          />

          <Legend
            formatter={() => (
              <span style={{ color: "#ffffff", fontWeight: 500 }}>
                Number of Cases
              </span>
            )}
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
