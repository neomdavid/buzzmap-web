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
  ReferenceLine,
} from "recharts";
import { ChartContainer } from "../ui/chart";
import {
  useGetBarangayWeeklyTrendsQuery,
  useGetBarangaysQuery,
  useGetPatternRecognitionResultsQuery,
} from "../../api/dengueApi";
import { useState, useMemo } from "react";
import { ArrowClockwise } from "phosphor-react";
import { IconReload } from "@tabler/icons-react";
import {
  PATTERN_TYPES,
  PATTERN_COLORS,
  PATTERN_LABELS,
  getPatternColor,
  normalizePatternType,
} from "../../utils/patternConfig";

const getPatternColorForChart = (patternType) => {
  // Convert pattern type to lowercase for case-insensitive comparison
  const normalizedPattern = normalizePatternType(patternType);
  return getPatternColor(normalizedPattern, "stroke");
};

// Update the pattern levels to use centralized configuration
const patternLevels = [
  {
    label: PATTERN_LABELS[PATTERN_TYPES.SPIKE],
    color: getPatternColor(PATTERN_TYPES.SPIKE, "stroke"),
  },
  {
    label: PATTERN_LABELS[PATTERN_TYPES.INCREASE],
    color: getPatternColor(PATTERN_TYPES.INCREASE, "stroke"),
  },
  {
    label: PATTERN_LABELS[PATTERN_TYPES.DECREASE],
    color: getPatternColor(PATTERN_TYPES.DECREASE, "stroke"),
  },
  {
    label: PATTERN_LABELS[PATTERN_TYPES.LOW_LEVEL_ACTIVITY],
    color: getPatternColor(PATTERN_TYPES.LOW_LEVEL_ACTIVITY, "stroke"),
  },
  {
    label: PATTERN_LABELS[PATTERN_TYPES.NO_CHANGE],
    color: getPatternColor(PATTERN_TYPES.NO_CHANGE, "stroke"),
  },
];

// Helper function to format pattern type for display
const formatPatternType = (patternType) => {
  if (!patternType) return "No pattern detected";

  const normalizedPattern = normalizePatternType(patternType);
  return PATTERN_LABELS[normalizedPattern] || "No Pattern";
};

export default function DengueTrendChart({
  selectedBarangay,
  onBarangayChange,
}) {
  const [weeks, setWeeks] = useState(12);
  const [refreshNum, setRefreshNum] = useState(0);
  const [intervalType, setIntervalType] = useState("biweekly");

  // Fetch barangays
  const { data: barangaysData, isLoading: barangaysLoading } =
    useGetBarangaysQuery();

  // Fetch pattern recognition results
  const { data: patternData } = useGetPatternRecognitionResultsQuery();

  // Get pattern type for selected barangay from pattern recognition results
  const selectedBarangayPattern = selectedBarangay
    ? (() => {
        const barangay = patternData?.data?.find(
          (b) => b.name.toLowerCase() === selectedBarangay.toLowerCase()
        );
        return barangay?.pattern || "";
      })()
    : "";

  const skipTrends = !selectedBarangay;
  const {
    data: trendsData,
    isLoading,
    error,
    isFetching,
    refetch,
  } = useGetBarangayWeeklyTrendsQuery(
    skipTrends
      ? { barangay_name: "", number_of_weeks: weeks }
      : { barangay_name: selectedBarangay, number_of_weeks: weeks },
    { skip: skipTrends }
  );

  // Detect the specific not-found condition coming from the API
  const barangayNotFound = useMemo(() => {
    const apiFlag =
      trendsData &&
      trendsData.success === false &&
      (trendsData.error === "Barangay not found in dataset" ||
        (typeof trendsData.error === "string" &&
          trendsData.error.toLowerCase().includes("barangay not found")));
    const errData = error && error.data ? error.data : {};
    const errMsg =
      (errData.error || errData.message || error?.error || "") + "";
    const errFlag = errMsg.toLowerCase().includes("barangay not found");
    return Boolean(apiFlag || errFlag);
  }, [trendsData, error]);

  // Treat HTTP 404 as a not-found dataset state as well
  const httpNotFound = useMemo(() => {
    const statuses = [
      error?.status,
      error?.originalStatus,
      error?.data?.status,
    ];
    return statuses.includes && statuses.includes(404)
      ? true
      : statuses.some?.((s) => s === 404);
  }, [error]);

  // Transform the API data to match the chart format
  const chartData = useMemo(() => {
    try {
      if (!trendsData?.data?.complete_weeks) {
        console.log("[DEBUG] No complete weeks data available");
        return [];
      }

      const completeWeeks = trendsData.data.complete_weeks || {};

      // Transform complete weeks
      let weekEntries = Object.entries(completeWeeks)
        .map(([week, info], index, array) => {
          const entry = {
            week: formatDateRange(info.date_range),
            cases: info.count,
            dateRange: info.date_range,
            patternType: selectedBarangayPattern,
            color:
              index >= array.length - 4
                ? getPatternColorForChart(selectedBarangayPattern)
                : "#9ca3af",
            weekNumber: index, // Add week number for reference line calculation
          };
          return entry;
        })
        .sort((a, b) => {
          // Sort by the start date of the range
          const dateA = new Date(a.dateRange[0]);
          const dateB = new Date(b.dateRange[0]);
          return dateA - dateB;
        });

      // If interval type is biweekly, combine every two weeks
      if (intervalType === "biweekly") {
        const biweeklyEntries = [];
        for (let i = 0; i < weekEntries.length; i += 2) {
          if (i + 1 < weekEntries.length) {
            // Combine two weeks
            const firstWeek = weekEntries[i];
            const secondWeek = weekEntries[i + 1];
            biweeklyEntries.push({
              week: `${formatDateRange(firstWeek.dateRange)} - ${
                formatDateRange(secondWeek.dateRange).split(" - ")[1]
              }`,
              cases: firstWeek.cases + secondWeek.cases,
              dateRange: [firstWeek.dateRange[0], secondWeek.dateRange[1]],
              patternType: selectedBarangayPattern,
              color:
                i >= weekEntries.length - 4
                  ? getPatternColorForChart(selectedBarangayPattern)
                  : "#9ca3af",
              weekNumber: firstWeek.weekNumber, // Keep the first week's number for reference
            });
          } else {
            // If there's an odd number of weeks, add the last week as is
            biweeklyEntries.push(weekEntries[i]);
          }
        }
        weekEntries = biweeklyEntries;
      }

      return weekEntries;
    } catch (error) {
      console.error("[DEBUG] Error transforming chart data:", error);
      return [];
    }
  }, [trendsData, selectedBarangayPattern, intervalType]);

  // Find the reference line position based on weeks
  const referenceLinePosition = useMemo(() => {
    if (!chartData.length) return null;

    // For biweekly, we want the 2nd-to-last point (representing 4 weeks)
    // For weekly, we want the 4th-to-last point
    const index =
      intervalType === "biweekly" ? chartData.length - 2 : chartData.length - 4;

    // Ensure we don't go out of bounds
    if (index < 0) return chartData[0]?.week;

    return chartData[index]?.week;
  }, [chartData, intervalType]);

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

  // Find the max cases for the current chartData (for consistent Y axis)
  const maxCases = useMemo(() => {
    try {
      const max = Math.max(...chartData.map((d) => d.cases || 0));
      // If max is greater than 10, round up to the next multiple of 2
      return max > 10 ? Math.ceil(max / 2) * 2 : 10;
    } catch (error) {
      console.error("[DEBUG] Error calculating max cases:", error);
      return 10;
    }
  }, [chartData]);

  // Generate ticks based on max value
  const yAxisTicks = useMemo(() => {
    const ticks = [];
    for (let i = 0; i <= maxCases; i += 2) {
      ticks.push(i);
    }
    return ticks;
  }, [maxCases]);

  // Extra diagnostics for visibility
  if (error) {
    console.log("[DengueTrendChart] Raw error object:", error);
  }
  if (trendsData !== undefined) {
    console.log("[DengueTrendChart] Raw trendsData:", trendsData);
  }

  if (isLoading || barangaysLoading) {
    return (
      <div className="flex flex-col p-5 gap-4 items-center justify-center h-[400px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Always render header & selectors
  const showNoData =
    barangayNotFound || httpNotFound || !chartData || chartData.length === 0;

  return (
    <div className="flex flex-col p-5 gap-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-base-content text-xl font-semibold mb-1">
            Dengue Cases Trend - {selectedBarangay || "—"}
          </p>
          <p className="text-base-content text-sm">
            Pattern:{" "}
            <span
              style={{
                color: getPatternColorForChart(selectedBarangayPattern),
                fontWeight: "bold",
              }}
            >
              {formatPatternType(selectedBarangayPattern)}
            </span>
          </p>
        </div>
        <div className="flex gap-4">
          <label htmlFor="dtc-barangay" className="sr-only">
            Select barangay
          </label>
          <select
            id="dtc-barangay"
            aria-label="Select barangay"
            value={selectedBarangay}
            onChange={(e) => onBarangayChange(e.target.value)}
            className="select select-bordered w-full max-w-xs bg-white/10 text-base-content border-base-content/20 [&>option]:text-black"
          >
            {barangaysLoading ? (
              <option>Loading barangays...</option>
            ) : barangaysData ? (
              barangaysData.map((b) => (
                <option key={b._id} value={b.name}>
                  {b.name}
                </option>
              ))
            ) : (
              <option>No barangays available</option>
            )}
          </select>
          <label htmlFor="dtc-interval" className="sr-only">
            Select interval
          </label>
          <select
            id="dtc-interval"
            aria-label="Select interval"
            value={intervalType}
            onChange={(e) => setIntervalType(e.target.value)}
            className="select select-bordered w-full max-w-xs bg-white/10 text-base-content border-base-content/20 [&>option]:text-black"
          >
            <option value="biweekly">Bi-weekly</option>
          </select>
          <label htmlFor="dtc-weeks" className="sr-only">
            Select week range
          </label>
          <select
            id="dtc-weeks"
            aria-label="Select week range"
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

      <ChartContainer className="h-full w-full flex flex-col gap-2 relative">
        {showNoData ? (
          <div className="w-full h-[400px] rounded border border-gray-200 bg-white flex items-center justify-center">
            <p className="text-gray-700 text-sm">
              There has been no recorded dengue cases for{" "}
              {selectedBarangay || "this barangay"}.
            </p>
          </div>
        ) : (
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
                tick={{ fontSize: 11, fontFamily: "Inter", fill: "#000000" }}
              />
              <Tooltip />
              <Legend
                formatter={() => "Number of Cases"}
                wrapperStyle={{
                  color: "#000000",
                  fontSize: "14px",
                  marginLeft: "45px",
                  marginBottom: "-2px",
                }}
                align="left"
              />
              {referenceLinePosition && (
                <ReferenceLine
                  x={referenceLinePosition}
                  stroke="#9ca3af"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
              )}
              <Line
                type="monotone"
                dataKey="cases"
                stroke={getPatternColorForChart(selectedBarangayPattern)}
                strokeWidth={3}
                dot={{
                  r: 5,
                  strokeWidth: 2,
                  fill: getPatternColorForChart(selectedBarangayPattern),
                  stroke: getPatternColorForChart(selectedBarangayPattern),
                }}
                activeDot={{
                  r: 7,
                  strokeWidth: 2,
                  fill: getPatternColorForChart(selectedBarangayPattern),
                  stroke: getPatternColorForChart(selectedBarangayPattern),
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>

      <div className="flex flex-wrap justify-start gap-3 ml-3 ">
        {patternLevels.map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-lg text-neutral-content">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
