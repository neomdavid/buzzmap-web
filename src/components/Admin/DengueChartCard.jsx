import React, { useState, useMemo } from "react";
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
import {
  useGetAdminBarangaysQuery,
  useGetBarangayWeeklyTrendsQuery,
} from "../../api/dengueApi";
import {
  getPatternColor,
  getPatternLabel,
  normalizePatternType,
} from "../../utils/patternConfig";

// Custom components for the chart
const CustomizedAxisTick = ({ x, y, payload }) => (
  <g transform={`translate(${x},${y})`}>
    <text x={0} y={0} dy={16} textAnchor="middle" fill="#fff" fontSize={12}>
      {payload.value}
    </text>
  </g>
);

const CustomizedLabel = ({ x, y, value }) => (
  <text x={x} y={y} dy={-10} textAnchor="middle" fill="#fff" fontSize={12}>
    {value}
  </text>
);

export default function DengueChartCard() {
  const [selectedBarangay, setSelectedBarangay] = useState("bahay toro");
  const [weeks, setWeeks] = useState(6);

  // Fetch admin barangays (contains status and recommendations)
  const { data: barangaysData, isLoading: barangaysLoading } =
    useGetAdminBarangaysQuery();

  // Get pattern for selected barangay from admin barangays endpoint
  const selectedBarangayPattern = useMemo(() => {
    if (!selectedBarangay) return "none";
    let pattern;
    if (Array.isArray(barangaysData)) {
      const barangay = barangaysData.find(
        (b) => b.name?.toLowerCase() === selectedBarangay.toLowerCase()
      );
      pattern = barangay?.status_and_recommendation?.pattern_based?.status;
    }
    pattern = (pattern || "none").toLowerCase();
    return pattern;
  }, [barangaysData, selectedBarangay]);

  const {
    data: trendsData,
    isLoading,
    error,
  } = useGetBarangayWeeklyTrendsQuery({
    barangay_name: selectedBarangay,
    number_of_weeks: weeks,
  });

  // Get color based on pattern using centralized configuration
  const lineColor = getPatternColor(selectedBarangayPattern, "stroke");

  // Helper to format date range
  function formatDateRange(dateRange) {
    if (!Array.isArray(dateRange) || dateRange.length !== 2) return "";
    const [start, end] = dateRange;
    const startDate = new Date(start);
    const endDate = new Date(end);
    // Format as 'MMM D - MMM D' or 'MMM D - D' if same month
    const options = { month: "short", day: "numeric" };
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.toLocaleDateString(
        undefined,
        options
      )} - ${endDate.getDate()}`;
    }
    return `${startDate.toLocaleDateString(
      undefined,
      options
    )} - ${endDate.toLocaleDateString(undefined, options)}`;
  }

  // Transform the API data to match the chart format (handle both old and new API structures)
  const chartData = useMemo(() => {
    // New structure (per sample): data = { current_week, complete_weeks }
    const newCompleteWeeks = trendsData?.data?.complete_weeks;
    const newCurrentWeek = trendsData?.data?.current_week;

    // Old structure (previously implemented): data = { weekly_counts: { current_week, complete_weeks } }
    const oldCompleteWeeks = trendsData?.data?.weekly_counts?.complete_weeks;
    const oldCurrentWeek = trendsData?.data?.weekly_counts?.current_week;

    const completeWeeks = newCompleteWeeks || oldCompleteWeeks || {};
    const currentWeek = newCurrentWeek || oldCurrentWeek;

    if (!completeWeeks && !currentWeek) return [];

    // Transform complete weeks (defensively handle nulls)
    const weekEntries = Object.entries(completeWeeks || {})
      .map(([week, info]) => {
        const safeDateRange =
          Array.isArray(info?.date_range) && info.date_range.length === 2
            ? info.date_range
            : null;
        const safeCases = Number(info?.count ?? 0);
        return {
          week: formatDateRange(safeDateRange),
          cases: safeCases,
          dateRange: safeDateRange,
        };
      })
      .filter((entry) => Array.isArray(entry.dateRange))
      .sort((a, b) => {
        // Sort by the start date of the range; guard against invalid dates
        const dateA = a.dateRange ? new Date(a.dateRange[0]) : new Date(0);
        const dateB = b.dateRange ? new Date(b.dateRange[0]) : new Date(0);
        return dateA - dateB;
      });

    // Optionally add current week
    if (currentWeek) {
      const cwDateRange =
        Array.isArray(currentWeek?.date_range) &&
        currentWeek.date_range.length === 2
          ? currentWeek.date_range
          : null;
      if (cwDateRange) {
        weekEntries.push({
          week: formatDateRange(cwDateRange),
          cases: Number(currentWeek?.count ?? 0),
          dateRange: cwDateRange,
        });
      }
    }

    return weekEntries;
  }, [trendsData]);

  const chartLabels = chartData.map((d) => d.week);
  const chartCases = chartData.map((d) => d.cases);

  // Find the max cases for the current chartData (for consistent Y axis)
  const maxCases = chartCases.length > 0 ? Math.max(5, ...chartCases) : 10;

  console.log("Transformed Chart Data:", chartData);

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

  // Do not early-return on empty data; keep UI usable and show toast instead

  return (
    <div className="w-full bg-primary p-6 rounded-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <p className="text-2xl text-center font-semibold text-white">
            Weekly Dengue Cases - {selectedBarangay}
          </p>
          <p className="text-sm text-white">
            Pattern:{" "}
            <span className="font-semibold" style={{ color: lineColor }}>
              {getPatternLabel(normalizePatternType(selectedBarangayPattern))}
            </span>
          </p>
        </div>
        <div className="flex gap-4">
          <label htmlFor="dc-barangay" className="sr-only">
            Select barangay
          </label>
          <select
            id="dc-barangay"
            aria-label="Select barangay"
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
          <label htmlFor="dc-weeks" className="sr-only">
            Select week range
          </label>
          <select
            id="dc-weeks"
            aria-label="Select week range"
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
      {(chartData?.length ?? 0) === 0 ? (
        <div className="w-full h-[200px] bg-primary/60 rounded-sm flex items-center justify-center">
          <p className="text-white/80">
            No chart data available for {selectedBarangay} with the selected
            week range.
          </p>
        </div>
      ) : (
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
              labelStyle={{ color: "#222" }}
              itemStyle={{ color: "#222" }}
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
      )}
    </div>
  );
}
