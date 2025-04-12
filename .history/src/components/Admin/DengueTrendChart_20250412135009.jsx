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
import { useState, useEffect } from "react";
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

const severityLevels = [
  { label: "High", color: "red" },
  { label: "Medium", color: "orange" },
  { label: "Low", color: "green" },
];

export default function DengueTrendChart() {
  // State to track screen width and breakpoint
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1028);

  // Update screen width on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Choose different chart properties based on the screen size (lg breakpoint)
  const chartHeight = isLargeScreen ? 300 : 200; // Larger height for `lg` screens

  return (
    <div className="flex flex-col p-5 gap-4">
      <p className="text-base-content text-xl font-semibold mb-1">
        Dengue Cases Trend (Last {rawData.length} weeks)
      </p>
      <ChartContainer className="h-full w-full flex flex-col gap-2">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={rawData}
            margin={{ left: -38, top: 10, right: 4, bottom: 5 }}
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
        <div className="mt-[-2px] flex justify-start gap-14 ml-3 ">
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
