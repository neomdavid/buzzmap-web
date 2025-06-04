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
import { IconChecks, IconMapPins, IconTag, IconListDetails, IconChevronRight, IconChevronLeft } from "@tabler/icons-react"; // Replaced IconFileDescription with IconListDetails
import { Circle, Lightbulb } from "phosphor-react";
import dayjs from 'dayjs'; // Import dayjs
import { useEffect, useState } from 'react'; // Import useState
import React from 'react';
import AddInterventionModal from "../../components/Admin/AddInterventionModal";

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

  // Tab state hooks at the top level
  const [activeTab, setActiveTab] = useState('spike');
  const [showAllTabs, setShowAllTabs] = useState(false);

  // Carousel state for recommendations
  const [cardStartIndex, setCardStartIndex] = useState(0);
  const cardsPerPage = 3;
  const cards = filteredRecommendations.filter(item => item.patternType === activeTab);
  const visibleCards = cards.slice(cardStartIndex, cardStartIndex + cardsPerPage);

  // Extract shared info for the current pattern (if any cards exist)
  const sharedPattern = cards[0]?.patternType;
  const sharedSuggestedAction = cards[0]?.suggestedAction;
  const sharedIssueDetected = cards[0]?.issueDetected;

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

  // Tab logic
  const tabOrder = ['spike', 'gradual_rise', 'stability', 'decline', 'none'];
  const patternMeta = {
    spike: { label: 'Spike', color: 'text-error', border: 'border-error' },
    gradual_rise: { label: 'Gradual Rise', color: 'text-warning', border: 'border-warning' },
    stability: { label: 'Stability', color: 'text-info', border: 'border-info' },
    decline: { label: 'Decline', color: 'text-success', border: 'border-success' },
    none: { label: 'No Pattern', color: 'text-gray-500', border: 'border-gray-300' },
  };
  // Only include patterns that exist in the recommendations
  const availablePatterns = tabOrder.filter(p => filteredRecommendations.some(item => item.patternType === p));
  const tabOptions = availablePatterns.map(p => ({
    value: p,
    label: patternMeta[p]?.label || p.charAt(0).toUpperCase() + p.slice(1).replace('_', ' '),
    color: patternMeta[p]?.color || 'text-gray-500',
    border: patternMeta[p]?.border || 'border-gray-300',
  }));
  // Tabs to show initially and when expanded
  const initialTabs = tabOptions.slice(0, 2);
  const extraTabs = tabOptions.slice(2);

  // Reset cardStartIndex when activeTab changes
  useEffect(() => {
    setCardStartIndex(0);
  }, [activeTab]);

  // State for AddInterventionModal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [selectedUrgency, setSelectedUrgency] = useState(null);

  // Pattern urgency map (should match ActionRecommendationCard)
  const patternUrgencyMap = {
    spike: 'Immediate Action Required',
    gradual_rise: 'Action Required Soon',
    stability: 'Monitor Situation',
    decline: 'Continue Monitoring',
    none: 'No Specific Pattern',
  };

  if (isLoadingInterventions || isLoadingPosts || isLoadingBarangays) {
    return <div>Loading...</div>;
  }

  if (errorInterventions || errorPosts || errorBarangays) {
    return <div>Error loading data: {errorInterventions?.message || errorPosts?.message || errorBarangays?.message}</div>;
  }

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
        <div className="flex flex-col w-full gap-6">
          <p className="text-base-content text-4xl font-bold mb-2">Prescriptive Action Recommendations</p>
          <div className="flex gap-4 mb-2 flex-wrap items-center">
            {initialTabs.map(tab => (
              <button
                key={tab.value}
                className={`px-6 py-2 rounded-full font-semibold border-2 transition-colors duration-200 ${activeTab === tab.value ? `${tab.color} ${tab.border} bg-white` : 'text-gray-500 border-transparent bg-gray-100 hover:bg-white'}`}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
            <div className="flex items-center">
              <div className={`flex flex-row items-center overflow-hidden transition-all duration-300 ease-in-out ${showAllTabs ? 'max-w-2xl ml-2' : 'max-w-0'}`} style={{gap: '1rem'}}>
                {extraTabs.map(tab => (
                  <button
                    key={tab.value}
                    className={`px-6 py-2 rounded-full font-semibold border-2 transition-colors duration-200 ${activeTab === tab.value ? `${tab.color} ${tab.border} bg-white` : 'text-gray-500 border-transparent bg-gray-100 hover:bg-white'}`}
                    onClick={() => setActiveTab(tab.value)}
                    style={{transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)'}}>
                    {tab.label}
                  </button>
                ))}
              </div>
              {extraTabs.length > 0 && (
                <button
                  className="px-2 py-2 rounded-full border-2 border-gray-300 bg-gray-100 hover:bg-white flex items-center justify-center ml-2 transition-all duration-300 ease-in-out"
                  onClick={() => setShowAllTabs(v => !v)}
                  title={showAllTabs ? "Hide extra patterns" : "Show more patterns"}
                >
                  {showAllTabs ? <IconChevronLeft size={20} /> : <IconChevronRight size={20} />}
                </button>
              )}
            </div>
          </div>
          <div className=" rounded-xl shadow p-4">
            {cards.length > 0 ? (
              <>
                {/* Centered, colored shared info box for the current pattern */}
                <div
                  className={` flex flex-col items-center justify-center text-center rounded-2xl  px-6 py-4 w-full mx-auto
                    ${sharedPattern === 'spike' ? 'border-error' : ''}
                    ${sharedPattern === 'gradual_rise' ? 'border-warning' : ''}
                    ${sharedPattern === 'stability' ? 'border-info' : ''}
                    ${sharedPattern === 'decline' ? 'border-success' : ''}
                    ${sharedPattern === 'none' ? 'border-gray-300' : ''}
                  `}
                  style={{ maxWidth: 600 }}
                >
                  {/* Action Required label with bg color */}
                  <p className={`text-lg font-bold mb-3 px-4 py-1 rounded-xl inline-block
                    ${sharedPattern === 'spike' ? 'bg-error text-white' : ''}
                    ${sharedPattern === 'gradual_rise' ? 'bg-warning text-white' : ''}
                    ${sharedPattern === 'stability' ? 'bg-info text-white' : ''}
                    ${sharedPattern === 'decline' ? 'bg-success text-white' : ''}
                    ${sharedPattern === 'none' ? 'bg-gray-300 text-gray-700' : ''}
                  `}>
                    {/* Use urgency text from pattern styles */}
                    {(() => {
                      const patternUrgency = {
                        spike: 'Immediate Action Required',
                        gradual_rise: 'Action Required Soon',
                        stability: 'Monitor Situation',
                        decline: 'Continue Monitoring',
                        none: 'No Specific Pattern',
                      };
                      return patternUrgency[sharedPattern] || 'Action Required';
                    })()}
                  </p>
                  {sharedPattern && (
                    <p className="text-base font-semibold mb-1 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center"><Circle weight="fill" size={16} className={
                        sharedPattern === 'spike' ? 'text-error' :
                        sharedPattern === 'gradual_rise' ? 'text-warning' :
                        sharedPattern === 'stability' ? 'text-info' :
                        sharedPattern === 'decline' ? 'text-success' :
                        'text-gray-400'} /></span>
                      <span>Pattern:</span> <span className="capitalize">{sharedPattern.replace('_', ' ')}</span>
                    </p>
                  )}
                  {sharedSuggestedAction && (
                    <p className="text-base mb-1 flex items-center justify-center gap-2 flex-wrap">
                      <span className="inline-flex items-center whitespace-nowrap"><Lightbulb weight="fill" size={16} className="text-primary" /></span>
                      <span className="whitespace-nowrap">Suggested Action:</span>
                      <span className="font-medium break-words text-left">{sharedSuggestedAction}</span>
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleCards.map(item => (
                    <div key={item.name + item.patternType} className="flex flex-col items-center">
                      <ActionRecommendationCard
                        barangay={item.name}
                        patternType={item.patternType}
                        issueDetected={item.issueDetected}
                        suggestedAction={item.suggestedAction}
                        hideSharedInfo={true}
                      />
                      {(['spike', 'gradual_rise', 'stability'].includes(item.patternType)) && (
                        <button
                          className="mt-4 bg-primary text-white px-4 py-2 rounded-full shadow font-semibold hover:bg-primary/80 transition-all"
                          onClick={() => {
                            setSelectedBarangay(item.name);
                            setSelectedPattern(item.patternType);
                            setSelectedUrgency(patternUrgencyMap[item.patternType] || 'Action Required');
                            setShowAddModal(true);
                          }}
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    className="btn btn-sm"
                    onClick={() => setCardStartIndex(i => Math.max(0, i - cardsPerPage))}
                    disabled={cardStartIndex === 0}
                  >
                    Back
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() => setCardStartIndex(i => Math.min(cards.length - cardsPerPage, i + cardsPerPage))}
                    disabled={cardStartIndex + cardsPerPage >= cards.length}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 p-4 text-center">No {tabOptions.find(t => t.value === activeTab)?.label?.toLowerCase() || activeTab} recommendations available.</p>
            )}
          </div>
        </div>

        {/* Recent Intervention Records */}
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
      </section>

      {/* AddInterventionModal for Apply button */}
      {showAddModal && (
        <AddInterventionModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          preselectedBarangay={selectedBarangay}
          patternType={selectedPattern}
          patternUrgency={selectedUrgency}
        />
      )}
    </main>
  );
};

export default Interventions;
