"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartContainer } from "../ui/chart";

const rawData = [
  { week: "Week 1", cases: 18 },
  { week: "Week 2", cases: 32 },
  { week: "Week 3", cases: 51 },
  { week: "Week 4", cases: 47 },
  { week: "Week 5", cases: 22 },
  { week: "Week 6", cases: 55 },
];

const getSeverityColor = (cases) => {
  if (cases >= 50) return "red";
  if (cases >= 30) return "orange";
  return "green";
};

const renderCustomBarLabel = ({ x, y, width, value }) => {
  return (
    <text
      x={x + width / 2}
      y={y}
      fill="#444444"
      textAnchor="middle"
      dy={-6}
      fontSize={10}
      fontFamily="Inter"
      fontWeight="500"
    >
      {value}
    </text>
  );
};

// Custom legend items
const severityLevels = [
  { label: "High", color: "red" },
  { label: "Medium", color: "orange" },
  { label: "Low", color: "green" },
];

export default function DengueTrendChart() {
  return (
    <ChartContainer className="min-h-[260px] w-full flex flex-col gap-2">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={rawData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="0 0" vertical={false} />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fontFamily: "Inter", fill: "#000000" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fontFamily: "Inter", fill: "#000000" }}
          />

          <Tooltip />
          <Bar dataKey="cases" radius={10} label={renderCustomBarLabel}>
            {rawData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getSeverityColor(entry.cases)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Custom Legend */}
      <div className="flex justify-center gap-6">
        {severityLevels.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-gray-700">{label}</span>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
}
