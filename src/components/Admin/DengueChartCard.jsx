import React, { PureComponent, useState, useMemo } from "react";
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
import { useGetBarangayWeeklyTrendsQuery, useGetBarangaysQuery } from "../../api/dengueApi";

class CustomizedLabel extends PureComponent {
  render() {
    const { x, y, value } = this.props;
    return (
      <text
        x={x}
        y={y}
        dy={-11}
        fill="#fff"
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
          fill="#fff"
          transform="rotate(-35)"
        >
          {payload.value}
        </text>
      </g>
    );
  }
}

export default function DengueChartCard() {
  const [selectedBarangay, setSelectedBarangay] = useState('bahay toro');
  const [weeks, setWeeks] = useState(6);

  // Fetch barangays
  const { data: barangaysData, isLoading: barangaysLoading } = useGetBarangaysQuery();
  // Get pattern for selected barangay (from barangaysData)
  const selectedBarangayPattern = useMemo(() => {
    if (!barangaysData || !selectedBarangay) return 'none';
    const barangay = barangaysData.find(
      b => b.name?.toLowerCase() === selectedBarangay.toLowerCase()
    );
    // Debug logs
    console.log('[Admin DengueChartCard DEBUG] selectedBarangay:', selectedBarangay);
    console.log('[Admin DengueChartCard DEBUG] found barangay:', barangay);
    let pattern = barangay?.status_and_recommendation?.pattern_based?.status?.toLowerCase();
    if (!pattern || pattern === '') pattern = 'none';
    console.log('[Admin DengueChartCard DEBUG] selectedBarangayPattern:', pattern);
    return pattern;
  }, [barangaysData, selectedBarangay]);

  const { data: trendsData, isLoading, error } = useGetBarangayWeeklyTrendsQuery({
    barangay_name: selectedBarangay,
    number_of_weeks: weeks
  });

  // Get color based on pattern
  const PATTERN_COLORS = {
    spike: "#ef4444",        // Red
    gradual_rise: "#f97316", // Orange
    decline: "#22c55e",      // Green
    stability: "#3b82f6",    // Blue
    none: "#6b7280",         // Gray
    default: "#6b7280",      // Gray
  };
  const lineColor = PATTERN_COLORS[selectedBarangayPattern] || PATTERN_COLORS.default;

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

  // Transform the API data to match the chart format (new API structure)
  const chartData = useMemo(() => {
    if (!trendsData?.data?.weekly_counts) return [];
    const completeWeeks = trendsData.data.weekly_counts.complete_weeks || {};
    const currentWeek = trendsData.data.weekly_counts.current_week;

    // Transform complete weeks
    const weekEntries = Object.entries(completeWeeks)
      .map(([week, info]) => ({
        week: formatDateRange(info.date_range),
        cases: info.count,
        dateRange: info.date_range,
      }))
      .sort((a, b) => {
        // Sort by the start date of the range
        const dateA = new Date(a.dateRange[0]);
        const dateB = new Date(b.dateRange[0]);
        return dateA - dateB;
      });

    // Optionally add current week
    if (currentWeek) {
      weekEntries.push({
        week: formatDateRange(currentWeek.date_range),
        cases: currentWeek.count,
        dateRange: currentWeek.date_range,
      });
    }

    return weekEntries;
  }, [trendsData]);

  const chartLabels = chartData.map(d => d.week);
  const chartCases = chartData.map(d => d.cases);

  // Find the max cases for the current chartData (for consistent Y axis)
  const maxCases = Math.max(5, ...chartCases);

  console.log('Transformed Chart Data:', chartData);

  if (isLoading) {
    return (
      <div className="w-full bg-primary p-6 rounded-sm flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-white"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-primary p-6 rounded-sm flex items-center justify-center">
        <p className="text-white">Error loading chart data</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-primary p-6 rounded-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-2xl text-center font-semibold text-white">
            Weekly Dengue Cases - {selectedBarangay}
          </p>
          <p className="text-sm text-white">
            Pattern: <span className="font-semibold" style={{ color: lineColor }}>
              {selectedBarangayPattern.charAt(0).toUpperCase() + selectedBarangayPattern.slice(1).replace('_', ' ')}
            </span>
          </p>
        </div>
        <div className="flex gap-4">
          <select
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
            className="select select-bordered w-full max-w-xs bg-white/10 text-white border-white/20 [&>option]:text-black"
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
            className="select select-bordered w-full max-w-xs bg-white/10 text-white border-white/20 [&>option]:text-black"
          >
            <option value={4}>4 Weeks</option>
            <option value={6}>6 Weeks</option>
            <option value={8}>8 Weeks</option>
            <option value={12}>12 Weeks</option>
          </select>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 15, left: -25, bottom: 13 }}
        >
          <CartesianGrid strokeDasharray="0 0" vertical={false} />
          <XAxis
            dataKey="week"
            height={60}
            tick={<CustomizedAxisTick />}
            stroke="#fff"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            stroke="#fff"
            tick={{ fill: "#fff" }}
            allowDecimals={false}
            domain={[0, maxCases]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              color: "#222",
            }}
            labelStyle={{ color: '#222' }}
            itemStyle={{ color: '#222' }}
          />
          <Legend
            formatter={() => "Number of Cases"}
            wrapperStyle={{ color: "#fff" }}
          />
          <Line
            type="monotone"
            dataKey="cases"
            stroke={lineColor}
            strokeWidth={3}
            dot={{
              r: 5,
              stroke: lineColor,
              strokeWidth: 2,
              fill: lineColor,
            }}
            activeDot={{
              r: 7,
              stroke: lineColor,
              strokeWidth: 2,
              fill: lineColor,
            }}
            label={<CustomizedLabel />}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
