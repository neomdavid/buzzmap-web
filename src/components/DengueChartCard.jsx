import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useGetBarangayWeeklyTrendsQuery, useGetPatternRecognitionResultsQuery, useGetBarangaysQuery } from '../api/dengueApi';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PATTERN_COLORS = {
  spike: 'rgb(239, 68, 68)',        // Red (Tailwind error)
  gradual_rise: 'rgb(249, 115, 22)', // Orange (Tailwind warning)
  decline: 'rgb(34, 197, 94)',      // Green (Tailwind success)
  stability: 'rgb(59, 130, 246)',    // Blue (Tailwind info)
  none: 'rgb(107, 114, 128)',         // Gray (Tailwind gray-500)
  default: 'rgb(107, 114, 128)',      // Gray (Tailwind gray-500)
};

const DengueChartCard = () => {
  console.log('[DengueChartCard DEBUG] COMPONENT RENDER');
  const [selectedBarangay, setSelectedBarangay] = useState('bahay toro');
  const [weeks, setWeeks] = useState(6);

  // Fetch barangays for dropdown
  const { data: barangaysData, isLoading: barangaysLoading } = useGetBarangaysQuery();
  console.log('[DengueChartCard DEBUG] barangaysData (from getAllBarangays):', barangaysData);
  // Fetch pattern recognition results
  const { data: patternResults, isLoading: patternsLoading } = useGetPatternRecognitionResultsQuery();

  const { data: trendsData, isLoading: trendsLoading, error } = useGetBarangayWeeklyTrendsQuery({
    barangay_name: selectedBarangay,
    number_of_weeks: weeks
  });

  // Set default selectedBarangay once barangaysData is loaded
  useEffect(() => {
    if (barangaysData && barangaysData.length > 0 && selectedBarangay === 'bahay toro') {
      setSelectedBarangay(barangaysData[0].name); 
    }
  }, [barangaysData, selectedBarangay]);

  // Determine pattern for the selected barangay (from barangaysData)
  const selectedBarangayPattern = React.useMemo(() => {
    if (!barangaysData || !selectedBarangay) return 'none';
    const barangay = barangaysData.find(
      item => item.name?.toLowerCase() === selectedBarangay.toLowerCase()
    );
    // Debug logs
    console.log('[DengueChartCard DEBUG] selectedBarangay:', selectedBarangay);
    console.log('[DengueChartCard DEBUG] found barangay (from getAllBarangays):', barangay);
    let pattern = barangay?.status_and_recommendation?.pattern_based?.status?.toLowerCase();
    if (!pattern || pattern === '') pattern = 'none';
    console.log('[DengueChartCard DEBUG] selectedBarangayPattern (from getAllBarangays):', pattern);
    return pattern;
  }, [barangaysData, selectedBarangay]);

  const isLoading = barangaysLoading || patternsLoading || trendsLoading;

  // Get the correct color for the line based on the pattern
  const lineColor = PATTERN_COLORS[selectedBarangayPattern] || PATTERN_COLORS.default;

  const chartData = {
    labels: trendsData?.data?.weekly_counts ? Object.keys(trendsData.data.weekly_counts) : [],
    datasets: [
      {
        label: 'Dengue Cases',
        data: trendsData?.data?.weekly_counts ? Object.values(trendsData.data.weekly_counts) : [],
        borderColor: lineColor, // Use dynamic line color
        tension: 0.1,
        fill: false
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Dengue Cases Trend - ${selectedBarangay}`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Cases'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Week'
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-error">
        Error loading chart data
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold text-gray-700">Dengue Cases Trend</h2>
        <div className="flex gap-4">
          <select
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
            className="select select-bordered w-full max-w-xs bg-white text-gray-700"
          >
            {barangaysLoading ? (
              <option>Loading...</option>
            ) : (
              barangaysData?.map(barangay => (
                <option key={barangay._id || barangay.name} value={barangay.name}>
                  {barangay.name}
                </option>
              ))
            )}
          </select>
          <select
            value={weeks}
            onChange={(e) => setWeeks(Number(e.target.value))}
            className="select select-bordered w-full max-w-xs"
          >
            <option value={4}>4 Weeks</option>
            <option value={6}>6 Weeks</option>
            <option value={8}>8 Weeks</option>
            <option value={12}>12 Weeks</option>
          </select>
        </div>
      </div>
      <div className="mb-4 text-left">
        <p className="text-sm text-gray-600">
          Barangay: <span className="font-semibold">{selectedBarangay}</span>
        </p>
        <p className="text-sm text-gray-600">
          Pattern: <span style={{ color: lineColor, fontWeight: '600' }}>
            {selectedBarangayPattern.charAt(0).toUpperCase() + selectedBarangayPattern.slice(1).replace('_', ' ')}
          </span>
        </p>
      </div>
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DengueChartCard; 