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
  LineChart,
  Line,
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
const data = [
  { name: "Page A", uv: 400, pv: 2400, amt: 2400 },
  { name: "Page A", uv: 400, pv: 2400, amt: 2400 },
  { name: "Page A", uv: 400, pv: 2400, amt: 2400 },
];

export function TestChart() {
  return (
    <LineChart width={500} height={300} data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
      <Line type="monotone" dataKey="uv" stroke="#8884d8" />
      <Line type="monotone" dataKey="pv" stroke="#82ca9d" />
    </LineChart>
  );
}
