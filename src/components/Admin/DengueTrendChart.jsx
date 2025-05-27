"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartContainer } from "../ui/chart";
import { useGetBarangayWeeklyTrendsQuery, useGetBarangaysQuery, useGetPatternRecognitionResultsQuery } from "../../api/dengueApi";
import { useState, useMemo } from "react";

const getPatternColor = (patternType) => {
  // Convert pattern type to lowercase for case-insensitive comparison
  const patternTypeLower = patternType?.toLowerCase();
  
  if (patternTypeLower === 'spike') {
    return "#ef4444"; // Red
  }
  if (patternTypeLower === 'gradual_rise') {
    return "#f97316"; // Orange
  }
  if (patternTypeLower === 'stable' || patternTypeLower === 'stability') {
    return "#3b82f6"; // Blue
  }
  if (patternTypeLower === 'decline' || patternTypeLower === 'decreasing') {
    return "#22c55e"; // Green
  }
  
  // Default color if no pattern type
  return "#9ca3af"; // Gray
};

// Update the pattern levels
const patternLevels = [
  { label: "Spike", color: "#ef4444" },      // error/red
  { label: "Gradual Rise", color: "#f97316" }, // warning/orange
  { label: "Stability", color: "#3b82f6" },    // info/blue
  { label: "Decline", color: "#22c55e" },      // success/green
];

export default function DengueTrendChart({ selectedBarangay, onBarangayChange }) {
  const [weeks, setWeeks] = useState(6);

  // Fetch barangays
  const { data: barangaysData, isLoading: barangaysLoading } = useGetBarangaysQuery();
  
  // Fetch pattern recognition results
  const { data: patternData } = useGetPatternRecognitionResultsQuery();

  // Get pattern type for selected barangay from pattern recognition results
  const selectedBarangayPattern = selectedBarangay
    ? (() => {
        const barangay = patternData?.data?.find(
          (b) => b.name.toLowerCase() === selectedBarangay.toLowerCase()
        );
        return barangay?.pattern || '';
      })()
    : '';

  const { data: trendsData, isLoading, error } = useGetBarangayWeeklyTrendsQuery({
    barangay_name: selectedBarangay,
    number_of_weeks: weeks
  });

  // Transform the API data to match the chart format
  const chartData = useMemo(() => {
    try {
      if (!trendsData?.data?.weekly_counts) {
        console.log('[DEBUG] No weekly counts data available');
        return [];
      }

      console.log('[DEBUG] Raw weekly counts data:', trendsData.data.weekly_counts);

      const completeWeeks = trendsData.data.weekly_counts.complete_weeks || {};

      // Transform complete weeks
      const weekEntries = Object.entries(completeWeeks)
        .map(([week, info]) => ({
          week: formatDateRange(info.date_range),
          cases: info.count,
          dateRange: info.date_range,
          patternType: selectedBarangayPattern
        }))
        .sort((a, b) => {
          // Sort by the start date of the range
          const dateA = new Date(a.dateRange[0]);
          const dateB = new Date(b.dateRange[0]);
          return dateA - dateB;
        });

      console.log('[DEBUG] Transformed chart data:', weekEntries);
      return weekEntries;
    } catch (error) {
      console.error('[DEBUG] Error transforming chart data:', error);
      return [];
    }
  }, [trendsData, selectedBarangayPattern]);

  // Helper to format date range
  function formatDateRange(dateRange) {
    if (!Array.isArray(dateRange) || dateRange.length !== 2) return '';
    const [start, end] = dateRange;
    const startDate = new Date(start);
    const endDate = new Date(end);
    // Format as 'MMM D - MMM D' or 'MMM D - D' if same month
    const options = { month: 'short', day: 'numeric' };
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.toLocaleDateString(undefined, options)} - ${endDate.getDate()}`;
    }
    return `${startDate.toLocaleDateString(undefined, options)} - ${endDate.toLocaleDateString(undefined, options)}`;
  }

  // Find the max cases for the current chartData (for consistent Y axis)
  const maxCases = useMemo(() => {
    try {
      return Math.max(5, ...chartData.map(d => d.cases || 0));
    } catch (error) {
      console.error('[DEBUG] Error calculating max cases:', error);
      return 5;
    }
  }, [chartData]);

  if (isLoading || barangaysLoading) {
    return (
      <div className="flex flex-col p-5 gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    console.error('[DEBUG] Chart error:', error);
    return (
      <div className="flex flex-col p-5 gap-4">
        <p className="text-error">Error loading chart data: {error.message || 'Unknown error'}</p>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex flex-col p-5 gap-4">
        <p className="text-warning">No data available for the selected period</p>
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
            Pattern: <span style={{
              color: getPatternColor(selectedBarangayPattern),
              fontWeight: 'bold'
            }}>
              {selectedBarangayPattern || 'No pattern detected'}
            </span>
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedBarangay}
            onChange={(e) => onBarangayChange(e.target.value)}
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
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={chartData}
            margin={{ left: -38, top: 10, right: 4, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fontFamily: "Inter", fill: "#000000" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fontFamily: "Inter", fill: "#000000" }}
              allowDecimals={false}
              domain={[0, maxCases]}
            />
            <Tooltip />
            <Legend 
              formatter={(value) => "Number of Cases"}
              wrapperStyle={{ 
                color: "#000000",
                fontSize: "14px",
                marginLeft: "45px",
                marginBottom: "-2px"
              }}
              align="left"
            />
            <Line
              type="monotone"
              dataKey="cases"
              stroke={getPatternColor(selectedBarangayPattern)}
              strokeWidth={3}
              dot={{
                r: 5,
                stroke: getPatternColor(selectedBarangayPattern),
                strokeWidth: 2,
                fill: getPatternColor(selectedBarangayPattern),
              }}
              activeDot={{
                r: 7,
                stroke: getPatternColor(selectedBarangayPattern),
                strokeWidth: 2,
                fill: getPatternColor(selectedBarangayPattern),
              }}
              label={({ x, y, value }) => (
                <text
                  x={x}
                  y={y}
                  dy={-10}
                  fill="#444444"
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="Inter"
                  fontWeight="500"
                >
                  {value}
                </text>
              )}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Custom Legend */}
        <div className="mt-[8px] flex justify-start gap-14 ml-3">
          {patternLevels.map(({ label, color }) => (
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
