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
import { useGetBarangayWeeklyTrendsQuery } from '../api/dengueApi';

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

const DengueChartCard = () => {
  const [selectedBarangay, setSelectedBarangay] = useState('bahay toro');
  const [weeks, setWeeks] = useState(6);

  const { data: trendsData, isLoading, error } = useGetBarangayWeeklyTrendsQuery({
    barangay_name: selectedBarangay,
    number_of_weeks: weeks
  });

  const chartData = {
    labels: trendsData?.weeks || [],
    datasets: [
      {
        label: 'Dengue Cases',
        data: trendsData?.cases || [],
        borderColor: 'rgb(75, 192, 192)',
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
        <span className="loading loading-spinner loading-lg"></span>
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Dengue Cases Trend</h2>
        <div className="flex gap-4">
          <select
            value={selectedBarangay}
            onChange={(e) => setSelectedBarangay(e.target.value)}
            className="select select-bordered w-full max-w-xs"
          >
            <option value="bahay toro">Bahay Toro</option>
            {/* Add more barangay options here */}
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
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DengueChartCard; 