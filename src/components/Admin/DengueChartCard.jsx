import React, { PureComponent, useState } from "react";
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
import { useGetBarangayWeeklyTrendsQuery, useGetBarangaysQuery, useGetPatternRecognitionResultsQuery } from "../../api/dengueApi";

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

  // Get color based on risk level
  const getRiskColor = (riskLevel) => {
    switch(riskLevel) {
      case 'High': return "var(--color-error)";
      case 'Medium': return "var(--color-warning)";
      case 'Low': return "var(--color-success)";
      default: return "var(--color-error)";
    }
  };

  const lineColor = getRiskColor(selectedBarangayRisk);

  // Transform the API data to match the chart format
  const chartData = trendsData?.data?.weekly_counts 
    ? Object.entries(trendsData.data.weekly_counts)
        .map(([week, cases]) => ({
          month: week,
          cases: cases
        }))
        .sort((a, b) => {
          // Sort by week number
          const weekA = parseInt(a.month.split(' ')[1]);
          const weekB = parseInt(b.month.split(' ')[1]);
          return weekA - weekB;
        })
    : [];

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
            Risk Level: <span className={`font-semibold ${
              selectedBarangayRisk === 'High' ? 'text-error' :
              selectedBarangayRisk === 'Medium' ? 'text-warning' :
              'text-success'
            }`}>{selectedBarangayRisk}</span>
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
            dataKey="month"
            height={60}
            tick={<CustomizedAxisTick />}
            stroke="#fff"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            stroke="#fff"
            tick={{ fill: "#fff" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
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
