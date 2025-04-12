"use client";

import { Bar, BarChart } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

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
      <BarChart data={rawData}>
        {rawData.map((entry) => {
          // Determine the fill color based on the case severity
          const fillColor = getSeverityColor(entry.cases);
          return (
            <Bar
              key={entry.week}
              dataKey="cases"
              data={rawData}
              fill={fillColor}
              radius={4}
            />
          );
        })}
      </BarChart>
    </ChartContainer>
  );
}
