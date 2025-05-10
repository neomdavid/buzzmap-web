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
import { useGetBarangayWeeklyTrendsQuery, useGetBarangaysQuery, useGetPatternRecognitionResultsQuery } from "../../api/dengueApi";
import { useState } from "react";

const getSeverityColor = (cases, riskLevel) => {
  console.log('Getting color for:', { cases, riskLevel }); // Debug log
  
  // Convert risk level to lowercase for case-insensitive comparison
  const riskLevelLower = riskLevel?.toLowerCase();
  
  // First check the risk level from pattern recognition
  if (riskLevelLower === 'high') {
    console.log('Using High risk color');
    return "#ef4444"; // Red
  }
  if (riskLevelLower === 'medium') {
    console.log('Using Medium risk color');
    return "#f97316"; // Orange
  }
  if (riskLevelLower === 'low') {
    console.log('Using Low risk color');
    return "#22c55e"; // Green
  }
  
  // Fallback to case-based coloring if no risk level
  if (cases >= 50) return "#ef4444";
  if (cases >= 30) return "#f97316";
  return "#22c55e";
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

// Update the severity levels with direct color values
const severityLevels = [
  { label: "High", color: "#ef4444" },
  { label: "Medium", color: "#f97316" },
  { label: "Low", color: "#22c55e" },
];

export default function DengueTrendChart() {
  const [selectedBarangay, setSelectedBarangay] = useState('bahay toro');
  const [weeks, setWeeks] = useState(6);

  // Fetch barangays
  const { data: barangaysData, isLoading: barangaysLoading } = useGetBarangaysQuery();
  
  // Fetch pattern recognition results
  const { data: patternData } = useGetPatternRecognitionResultsQuery();
  console.log('Pattern Recognition Data:', patternData);

  // Get risk level for selected barangay
  const selectedBarangayRisk = patternData?.data?.find(
    barangay => barangay.name.toLowerCase() === selectedBarangay.toLowerCase()
  )?.risk_level || 'Low';

  console.log('Selected Barangay Risk Level:', selectedBarangayRisk);

  const { data: trendsData, isLoading, error } = useGetBarangayWeeklyTrendsQuery({
    barangay_name: selectedBarangay,
    number_of_weeks: weeks
  });

  // Transform the API data to match the chart format
  const chartData = trendsData?.data?.weekly_counts 
    ? Object.entries(trendsData.data.weekly_counts)
        .map(([week, cases]) => ({
          week: week,
          cases: cases,
          riskLevel: selectedBarangayRisk // Add risk level to each data point
        }))
        .sort((a, b) => {
          // Sort by week number
          const weekA = parseInt(a.week.split(' ')[1]);
          const weekB = parseInt(b.week.split(' ')[1]);
          return weekA - weekB;
        })
    : [];

  console.log('Transformed Chart Data with Risk Levels:', chartData);

  // Log the data being passed to the chart
  console.log('Data being rendered in chart:', {
    selectedBarangay,
    weeks,
    chartData,
    isLoading,
    error
  });

  if (isLoading || barangaysLoading) {
    return (
      <div className="flex flex-col p-5 gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col p-5 gap-4">
        <p className="text-error">Error loading chart data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-base-content text-xl font-semibold mb-1">
            Dengue Cases Trend - {selectedBarangay}
          </p>
          <p className="text-base-content text-sm">
            Risk Level: <span style={{
              color: selectedBarangayRisk?.toLowerCase() === 'high' ? '#ef4444' :
                     selectedBarangayRisk?.toLowerCase() === 'medium' ? '#f97316' :
                     '#22c55e',
              fontWeight: 'bold'
            }}>
              {selectedBarangayRisk}
            </span>
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
            className="select select-bordered w-full max-w-xs bg-white/10 text-base-content border-base-content/20 [&>option]:text-black"
          >
            {barangaysLoading ? (
              <option>Loading barangays...</option>
            ) : barangaysData ? (
              barangaysData.map((barangay) => (
                <option key={barangay._id} value={barangay.name}>
                  {barangay.name}
                </option>
              ))
            ) : (
              <option>No barangays available</option>
            )}
          </select>
          <select
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            className="select select-bordered w-full max-w-xs bg-white/10 text-base-content border-base-content/20 [&>option]:text-black"
          >
            <option value={4}>4 Weeks</option>
            <option value={6}>6 Weeks</option>
            <option value={8}>8 Weeks</option>
            <option value={12}>12 Weeks</option>
          </select>
        </div>
      </div>
      <ChartContainer className="h-full w-full flex flex-col gap-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
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
              {chartData.map((entry, index) => {
                const color = getSeverityColor(entry.cases, entry.riskLevel);
                console.log(`Bar ${index} color:`, color); // Debug log
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={color}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Custom Legend */}
        <div className="mt-[-2px] flex justify-start gap-14 ml-3">
          {severityLevels.map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-lg text-primary">{label}</span>
            </div>
          ))}
        </div>
      </ChartContainer>
    </div>
  );
}
