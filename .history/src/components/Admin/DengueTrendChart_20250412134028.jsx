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
  if (cases >= 50) return "var(--color-error)"; // Red for error
  if (cases >= 30) return "var(--color-warning)"; // Orange for warning
  return "var(--color-success)"; // Green for success
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
    <div className="flex flex-col">
      <p className="text-base-content">
        Dengue Cases Trend (Last {rawData.length} weeks)
      </p>
      <ChartContainer className="h-full bg-primary  w-full flex flex-col gap-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rawData} margin={{ left: -34, bottom: 5 }}>
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
            <Bar dataKey="cases" radius={4} label={renderCustomBarLabel}>
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
        <div className="mt-[-2px] flex justify-start gap-14 ml-8">
          {severityLevels.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-lg text-primary ">{label}</span>
            </div>
          ))}
        </div>
      </ChartContainer>
    </div>
  );
}
