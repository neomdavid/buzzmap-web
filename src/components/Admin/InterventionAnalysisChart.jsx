import React, { useState, useEffect } from 'react';
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
import annotationPlugin from 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import { useAnalyzeInterventionEffectivityMutation } from '../../api/dengueApi';
import { formatDateWithRelativeTime } from '../../utils';

// Helper to format week range label
function formatWeekRange(startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  const options = { month: 'short', day: 'numeric' };
  const startStr = startDate.toLocaleDateString(undefined, options);
  const endStr = endDate.toLocaleDateString(undefined, options);
  const year = endDate.getFullYear();
  return `${startStr}–${endStr}, ${year}`;
}

// Register ChartJS components and annotation plugin
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

const InterventionAnalysisChart = ({ interventionId, onStats, percentChange }) => {
  const [analyzeEffectivity, { data: analysisData, isLoading, error }] = useAnalyzeInterventionEffectivityMutation();

  // Calculate summary stats
  let totalBefore = 0, totalAfter = 0, computedPercentChange = '-';
  if (analysisData?.analysis?.before_intervention && analysisData?.analysis?.after_intervention) {
    const beforeData = Object.values(analysisData.analysis.before_intervention);
    const afterData = Object.values(analysisData.analysis.after_intervention);
    totalBefore = beforeData.reduce((a, b) => a + b, 0);
    totalAfter = afterData.reduce((a, b) => a + b, 0);
    computedPercentChange = totalBefore === 0 ? (totalAfter === 0 ? 0 : 100) : (((totalAfter - totalBefore) / totalBefore) * 100).toFixed(1);
  }

  React.useEffect(() => {
    if (analysisData && onStats) {
      onStats({ totalBefore, totalAfter, percentChange: computedPercentChange });
    }
    // eslint-disable-next-line
  }, [analysisData, totalBefore, totalAfter, computedPercentChange, onStats]);

  useEffect(() => {
    if (interventionId) {
      console.log('Fetching analysis for intervention:', interventionId);
      analyzeEffectivity(interventionId)
        .unwrap()
        .then((response) => {
          console.log('=== API Response Debug ===');
          console.log('Full Response:', response);
          console.log('Response Type:', typeof response);
          console.log('Has Intervention:', !!response?.intervention);
          console.log('Has Analysis:', !!response?.analysis);
          if (response?.intervention) {
            console.log('Intervention Details:', {
              id: response.intervention.id,
              type: response.intervention.type,
              date: response.intervention.date,
              barangay: response.intervention.barangay
            });
          }
          if (response?.analysis) {
            console.log('Analysis Structure:', {
              hasBefore: !!response.analysis.before_intervention,
              hasAfter: !!response.analysis.after_intervention,
              beforeKeys: response.analysis.before_intervention ? Object.keys(response.analysis.before_intervention) : [],
              afterKeys: response.analysis.after_intervention ? Object.keys(response.analysis.after_intervention) : []
            });
            console.log('Before Data:', response.analysis.before_intervention);
            console.log('After Data:', response.analysis.after_intervention);
          }
          console.log('=== End API Response Debug ===');
        })
        .catch((error) => {
          console.error('=== API Error Debug ===');
          console.error('Error Object:', error);
          console.error('Error Status:', error.status);
          console.error('Error Data:', error.data);
          console.error('Error Message:', error.message);
          console.error('=== End API Error Debug ===');
        });
    }
  }, [interventionId, analyzeEffectivity]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (error) {
    // Show a user-friendly message for 422 errors
    if (error.status === 422 && error.data?.message) {
      return (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded w-full max-w-md text-center">
            <p className="font-semibold">Analysis Not Available</p>
            <p className="mt-2">{error.data.message}</p>
          </div>
        </div>
      );
    }
    // Generic error fallback
    return (
      <div className="flex items-center justify-center h-[300px] text-error">
        Error loading analysis data: {error.message}
      </div>
    );
  }

  if (!analysisData?.analysis?.before_intervention || !analysisData?.analysis?.after_intervention) {
    console.log('No analysis data available');
    return (
      <div className="flex items-center justify-center h-[300px]">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded w-full max-w-md text-center">
          <p className="font-semibold">Analysis Data Not Available</p>
          <p className="mt-2">The analysis data for this intervention is not available or incomplete.</p>
        </div>
      </div>
    );
  }

  // Log the complete data structure
  console.log('Complete Analysis Data Structure:', {
    intervention: analysisData.intervention,
    analysis: analysisData.analysis,
    beforeData: analysisData.analysis.before_intervention,
    afterData: analysisData.analysis.after_intervention,
    beforeWeeks: Object.keys(analysisData.analysis.before_intervention),
    afterWeeks: Object.keys(analysisData.analysis.after_intervention)
  });

  // Prepare before and after data
  const beforeData = Object.values(analysisData.analysis.before_intervention);
  const afterData = Object.values(analysisData.analysis.after_intervention);
  const beforeCount = beforeData.length;
  const afterCount = afterData.length;

  // Get intervention date
  const interventionDate = new Date(analysisData.intervention.date);

  // Build week number labels
  const beforeLabels = Array.from({ length: beforeCount }, (_, i) => `Week -${beforeCount - i}`);
  const afterLabels = Array.from({ length: afterCount }, (_, i) => `Week +${i + 1}`);
  const interventionLabel = `Intervention`;
  const labels = [...beforeLabels, interventionLabel, ...afterLabels];

  // For tooltip: calculate the week ranges for each point
  const weekRanges = [
    ...Array.from({ length: beforeCount }, (_, i) => {
      const weekStart = new Date(interventionDate);
      weekStart.setDate(weekStart.getDate() - 7 * (beforeCount - i));
      return formatWeekRange(weekStart);
    }),
    `Intervention (${interventionDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })})`,
    ...Array.from({ length: afterCount }, (_, i) => {
      const weekStart = new Date(interventionDate);
      weekStart.setDate(weekStart.getDate() + 7 * i);
      return formatWeekRange(weekStart);
    })
  ];

  // Data for two datasets: before and after
  const beforeDataset = [
    ...beforeData,
    null, // intervention point
    ...Array(afterCount).fill(null)
  ];
  const afterDataset = [
    ...Array(beforeCount + 1).fill(null), // before + intervention
    ...afterData
  ];

  // Determine after intervention color
  let afterColor = 'rgb(107, 114, 128)'; // gray-500
  if (typeof computedPercentChange === 'number' || !isNaN(Number(computedPercentChange))) {
    const pc = Number(computedPercentChange);
    if (pc < 0) afterColor = 'rgb(34, 197, 94)'; // green-500
    else if (pc > 0) afterColor = 'rgb(239, 68, 68)'; // red-500
  }

  // Log the new structure
  console.log('Chart Labels:', labels);
  console.log('Chart Data Array:', beforeDataset);
  console.log('Chart Data Array:', afterDataset);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Cases Before Intervention',
        data: beforeDataset,
        borderColor: 'rgb(107, 114, 128)', // gray-500
        backgroundColor: 'rgba(107, 114, 128, 0.5)',
        tension: 0.1,
        fill: false,
        spanGaps: true,
        pointRadius: 3,
        pointBackgroundColor: 'rgb(107, 114, 128)'
      },
      {
        label: ' DengCases After Intervention',
        data: afterDataset,
        borderColor: afterColor,
        backgroundColor: afterColor,
        tension: 0.1,
        fill: false,
        spanGaps: true,
        pointRadius: 3,
        pointBackgroundColor: afterColor
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // We'll use a custom legend below
      },
      title: {
        display: true,
        text: `Dengue Cases Analysis - ${analysisData.intervention.barangay}`,
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            const idx = tooltipItems[0].dataIndex;
            return weekRanges[idx];
          },
          label: (context) => `${context.raw ?? 'No data'} cases`
        }
      },
      annotation: {
        annotations: {
          interventionLine: {
            type: 'line',
            xMin: beforeCount,
            xMax: beforeCount,
            borderColor: 'rgb(249, 115, 22)',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              content: 'Intervention',
              enabled: true,
              position: 'top',
              color: 'rgb(249, 115, 22)',
              font: {
                weight: 'bold'
              }
            }
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Cases'
        },
        ticks: {
          stepSize: 1
        }
      },
      x: {
        title: {
          display: true,
          text: 'Weeks'
        }
      }
    }
  };

  // Custom legend
  const CustomLegend = ({ afterLineColor }) => (
    <div className="flex items-center gap-6 mb-2 ml-2">
      <div className="flex items-center gap-1">
        <span className="inline-block w-6 h-1.5 rounded bg-gray-500 mr-1" />
        <span className="text-md text-gray-700">Cases Before Intervention</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="inline-block w-6 h-1.5 rounded mr-1" style={{ backgroundColor: afterLineColor }} />
        <span className="text-md text-gray-700">Cases After Intervention</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 rounded-full border-2 border-dashed border-orange-500 mr-1" />
        <span className="text-md text-orange-500 font-semibold">Intervention</span>
      </div>
    </div>
  );

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-4">
        <p className="text-3xl font-bold text-primary">
          Intervention Details
        </p>
        <div className="mt-2 text-sm text-primary">
          <p className='text-lg'><span className="font-bold">Type:</span> {analysisData.intervention.type}</p>
          <p className='text-lg'><span className="font-bold">Date:</span> {formatDateWithRelativeTime(analysisData.intervention.date)}</p>
          <p className='text-lg'><span className="font-bold">Personnel:</span> {analysisData.intervention.personnel}</p>
        </div>
      </div>
      <CustomLegend afterLineColor={afterColor} />
      <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px] xl:h-[450px]">
        <Line key={JSON.stringify(chartData)} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default InterventionAnalysisChart; 