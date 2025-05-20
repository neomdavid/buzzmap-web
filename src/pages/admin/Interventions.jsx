import { Link } from "react-router-dom"; // Import Link for navigation
import {
  InterventionsTable,
  // FormCoordinationRequest, // Commented out as it's not used in the current visible layout
  ActionRecommendationCard,
} from "../../components";
import { useGetAllInterventionsQuery, useGetPostsQuery, useGetPatternRecognitionResultsQuery, useGetBarangaysQuery } from "../../api/dengueApi";
import { Bar, Pie } from 'react-chartjs-2'; // Pie and Bar will be removed from render
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { IconChecks, IconMapPins, IconTag, IconListDetails } from "@tabler/icons-react"; // Replaced IconFileDescription with IconListDetails
import dayjs from 'dayjs'; // Import dayjs
import { useEffect, useState } from 'react'; // Import useState
import React from 'react';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const Interventions = () => {
  const {
    data: interventions,
    isLoading: isLoadingInterventions,
    error: errorInterventions,
  } = useGetAllInterventionsQuery();
  const { 
    data: posts, 
    isLoading: isLoadingPosts, 
    error: errorPosts 
  } = useGetPostsQuery();

  // Fetch pattern recognition results
  const {
    data: barangaysList,
    isLoading: isLoadingBarangays,
    error: errorBarangays,
  } = useGetBarangaysQuery();

  // Log the raw patternResultsData when it's available
  useEffect(() => {
    if (barangaysList) {
      console.log("Raw Barangays List Data:", JSON.stringify(barangaysList, null, 2));
    }
  }, [barangaysList]);

  const completedInterventions = interventions ? interventions.filter(i => {
    const status = i.status?.toLowerCase();
    return status === 'completed' || status === 'complete';
  }) : [];

  // Calculate completed interventions for the current month
  const currentMonth = dayjs().month();
  const currentYear = dayjs().year();
  const completedThisMonthCount = completedInterventions.filter(i => {
    const interventionDate = dayjs(i.date);
    return interventionDate.month() === currentMonth && interventionDate.year() === currentYear;
  }).length;

  const barangaySet = new Set(completedInterventions.map(i => i.barangay));
  const totalBarangays = barangaySet.size;
  
  const typeCounts = completedInterventions.reduce((acc, i) => {
    acc[i.interventionType] = (acc[i.interventionType] || 0) + 1;
    return acc;
  }, {});
  const mostCommonTypeEntry = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  const mostCommonType = mostCommonTypeEntry ? mostCommonTypeEntry[0] : '-';
  
  const barangayCounts = completedInterventions.reduce((acc, i) => { // This will be unused if Bar chart is removed
    acc[i.barangay] = (acc[i.barangay] || 0) + 1;
    return acc;
  }, {});
  
  const totalInterventionsAllStatuses = interventions ? interventions.length : 0;
  
  const recentInterventions = [...completedInterventions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Pie chart data (by type) - Will be unused if Pie chart is removed
  // const pieData = { 
  //   labels: Object.keys(typeCounts),
  //   datasets: [
  //     {
  //       data: Object.values(typeCounts),
  //       backgroundColor: [
  //         '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#facc15', '#4ade80', '#38bdf8', '#f472b6'
  //       ],
  //     },
  //   ],
  // };

  // Bar chart data (by barangay) - Will be unused if Bar chart is removed
  // const barData = {
  //   labels: Object.keys(barangayCounts),
  //   datasets: [
  //     {
  //       label: 'Interventions',
  //       data: Object.values(barangayCounts),
  //       backgroundColor: '#60a5fa',
  //     },
  //   ],
  // };

  const [recommendationSearchQuery, setRecommendationSearchQuery] = useState("");
  const [patternFilter, setPatternFilter] = useState(""); // Empty string for "All Patterns"

  // Get unique pattern types for the filter dropdown (from barangaysList)
  const uniquePatternTypes = React.useMemo(() => {
    if (!barangaysList) return [];
    const patterns = new Set(
      barangaysList
        .map(b => b.status_and_recommendation?.pattern_based?.status)
        .filter(Boolean)
        .map(s => s.toLowerCase())
    );
    return Array.from(patterns).sort();
  }, [barangaysList]);

  // Apply filters and search to recommendations (from barangaysList)
  const filteredRecommendations = React.useMemo(() => {
    if (!barangaysList) return [];
    let recommendations = barangaysList
      .map(b => {
        const patternBased = b.status_and_recommendation?.pattern_based || {};
        // Get patternType ONLY from pattern_based.status
        let patternType = patternBased.status?.toLowerCase();
        if (!patternType || patternType === "") patternType = "none";
        return {
          name: b.name,
          patternType,
          issueDetected: patternBased.alert || '',
          suggestedAction: patternBased.recommendation || '',
        };
      })
      .filter(item => (item.issueDetected && item.issueDetected.toLowerCase() !== 'none') || (item.suggestedAction && item.suggestedAction.trim() !== ''));

    // Apply pattern filter
    if (patternFilter) {
      recommendations = recommendations.filter(item => item.patternType === patternFilter.toLowerCase());
    }

    // Apply search query
    if (recommendationSearchQuery) {
      const searchQueryLower = recommendationSearchQuery.toLowerCase();
      recommendations = recommendations.filter(item =>
        item.name?.toLowerCase().includes(searchQueryLower) ||
        item.issueDetected?.toLowerCase().includes(searchQueryLower) ||
        item.suggestedAction?.toLowerCase().includes(searchQueryLower) ||
        item.patternType?.toLowerCase().includes(searchQueryLower)
      );
    }
    return recommendations;
  }, [barangaysList, patternFilter, recommendationSearchQuery]);

  // Log what is being rendered in ActionRecommendationCard for debugging
  console.log('ActionRecommendationCard data:', filteredRecommendations);

  if (isLoadingInterventions || isLoadingPosts || isLoadingBarangays) {
    return <div>Loading...</div>;
  }

  if (errorInterventions || errorPosts || errorBarangays) {
    return <div>Error loading data: {errorInterventions?.message || errorPosts?.message || errorBarangays?.message}</div>;
  }

  // Helper function to find recommendation for a specific barangay
  const findRecommendationForBarangay = (barangayName) => {
    if (!barangaysList) return null;
    // Normalize names for robust matching
    const normalizedTargetName = barangayName.toLowerCase().replace(/barangay /g, '').trim();
    return barangaysList.find(item => 
      item.name?.toLowerCase().replace(/barangay /g, '').trim() === normalizedTargetName
    );
  };

  const commonwealthData = findRecommendationForBarangay("Commonwealth");
  const fairviewData = findRecommendationForBarangay("Fairview");
  // const holySpiritData = findRecommendationForBarangay("Holy Spirit"); // Will be replaced by dynamic rendering

  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12 text-center md:justify-start md:text-left md:w-[48%]">
        Interventions
      </p>

      {/* DASHBOARD SECTION - CARDS ONLY */}
      {/* <div className="max-w-6xl mx-auto w-full mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="flex flex-col rounded-2xl shadow bg-green-50 border border-green-100 px-6 py-5 items-center">
            <IconChecks size={28} className="text-green-600 mb-1" />
            <span className="text-3xl font-bold text-green-600">{completedThisMonthCount}</span>
            <span className="text-base font-medium text-green-700 mt-1 text-center">Completed (Current Month)</span>
          </div>
          <div className="flex flex-col rounded-2xl shadow bg-blue-50 border border-blue-100 px-6 py-5 items-center">
            <IconMapPins size={28} className="text-blue-600 mb-1" />
            <span className="text-3xl font-bold text-blue-600">{totalBarangays}</span>
            <span className="text-base font-medium text-blue-700 mt-1 text-center">Barangays Covered</span>
          </div>
          <div className="flex flex-col rounded-2xl shadow bg-purple-50 border border-purple-100 px-6 py-5 items-center">
            <IconTag size={28} className="text-purple-600 mb-1" />
            <span className="text-2xl font-bold text-purple-700 text-center">{mostCommonType}</span>
            <span className="text-base font-medium text-purple-700 mt-1 text-center">Most Common Type</span>
          </div>
          <div className="flex flex-col rounded-2xl shadow bg-orange-50 border border-orange-100 px-6 py-5 items-center">
            <IconListDetails size={28} className="text-orange-600 mb-1" />
            <span className="text-3xl font-bold text-orange-600">{totalInterventionsAllStatuses}</span>
            <span className="text-base font-medium text-orange-700 mt-1 text-center">Total Interventions</span>
          </div>
        </div>
        

    
      </div> */}
      {/* END DASHBOARD SECTION */}

      <section className="flex flex-col gap-16">
        <div className="flex justify-between items-center mb-[-35px]">
          <p className="text-base-content text-4xl font-bold ">
            Recent Intervention Records
          </p>
          {/* Link to View All Records */}
          <Link
            to="/admin/interventions/all"
            className="bg-primary text-center text-nowrap font-semibold text-white py-1 px-3 rounded-full text-sm hover:bg-primary/80 transition-all duration-200"
          >
            View All Records
          </Link>
        </div>
        <div className="h-135">
          {/* Pass the interventions data to the table */}
          <InterventionsTable interventions={interventions} onlyRecent={true} />
        </div>

        {/* New Intervention Effectivity Glimpse Section */}
        <div className="mt-8">
          <p className="text-base-content text-4xl font-bold mb-4">
            Intervention Effectivity
          </p>
          <Link
            to="/admin/interventions/e"
            className="block p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-200"
          >
            <p className="text-2xl font-bold text-primary mb-2">
              Analyze Intervention Impact
            </p>
            <p className="text-gray-600 text-lg mb-3">
              Review the effectiveness of past interventions. Click here to view detailed analysis and charts comparing dengue cases before and after specific interventions.
            </p>
            <div className="text-right">
              <span className="text-primary font-semibold hover:underline">
                View Full Analysis &rarr;
              </span>
            </div>
          </Link>
        </div>

        <div className="flex flex-col w-full gap-10 lg:flex-row">
          {/* <div className="lg:flex-21">
            <FormCoordinationRequest />
          </div> */}
          <div className="flex flex-col lg:flex-23 gap-4">
            <p className="text-base-content text-4xl font-bold mb-1">
              Prescriptive Action Recommendations
            </p>

            {/* Search and Filter UI for Recommendations */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4 p-4 bg-base-200 rounded-lg">
              <input 
                type="text"
                placeholder="Search recommendations (barangay, alert, pattern...)"
                value={recommendationSearchQuery}
                onChange={(e) => setRecommendationSearchQuery(e.target.value)}
                className="input input-bordered w-full sm:flex-1 bg-white"
              />
              <select 
                value={patternFilter}
                onChange={(e) => setPatternFilter(e.target.value)}
                className="select select-bordered w-full sm:w-auto bg-white"
              >
                <option value="">All Patterns</option>
                {uniquePatternTypes.map(pattern => (
                  <option key={pattern} value={pattern}>
                    {pattern.charAt(0).toUpperCase() + pattern.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamically render ActionRecommendationCards based on filteredRecommendations */}
            {filteredRecommendations.length > 0 ? (
              filteredRecommendations.map(item => (
                <ActionRecommendationCard
                  key={item.name + item.patternType}
                  barangay={item.name}
                  patternType={item.patternType}
                  issueDetected={item.issueDetected}
                  suggestedAction={item.suggestedAction}
                />
              ))
            ) : (
              <p className="text-gray-500 p-4 text-center">No recommendations match your criteria.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Interventions;
