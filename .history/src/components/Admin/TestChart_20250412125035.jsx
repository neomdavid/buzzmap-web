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
} from "recharts";
import { ChartContainer } from "../ui/chart";

// Raw data
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
            // Ensure `entry.cases` exists and is a valid number
            if (entry.cases !== undefined && entry.cases !== null) {
              const fillColor = getSeverityColor(entry.cases);
              return (
                <Bar
                  key={entry.week}
                  dataKey="cases"
                  fill={fillColor}
                  radius={4}
                  data={[entry]} // Pass only the current entry to the Bar
                />
              );
            } else {
              console.error("Invalid case data:", entry);
              return null; // Return null if data is invalid
            }
          })}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
