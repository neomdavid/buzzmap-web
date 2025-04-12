"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartContainer } from "../ui/chart";

// Raw data for dengue cases each week
const rawData = [
  { week: "Week 1", cases: 18 },
  { week: "Week 2", cases: 32 },
  { week: "Week 3", cases: 51 },
  { week: "Week 4", cases: 47 },
  { week: "Week 5", cases: 22 },
  { week: "Week 6", cases: 55 },
];

// Function to determine severity and return corresponding color
const getSeverityColor = (cases) => {
  if (cases >= 50) return "red"; // High severity
  if (cases >= 30) return "orange"; // Medium severity
  return "green"; // Low severity
};

// Custom label for bars to display the value on top of each bar
const renderCustomBarLabel = ({ payload, x, y, width, height, value }) => {
  return (
    <text x={x + width / 2} y={y} fill="#666" textAnchor="middle" dy={-6}>
      {value}
    </text>
  );
};

export function TestChart() {
  return (
    <ChartContainer className="min-h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rawData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          {rawData.map((entry) => {
            // Determine the fill color based on the case severity
            const fillColor = getSeverityColor(entry.cases);
            console.log(fillColor);
            return (
              <Bar dataKey="cases" radius={4} label={renderCustomBarLabel}>
                {rawData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getSeverityColor(entry.cases)}
                  />
                ))}
              </Bar>
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
