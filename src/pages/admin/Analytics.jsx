import { Check, Upload, Warning, ChartLineUp, Skull } from "phosphor-react";
import { alerts } from "../../utils";
import {
  ActionPlanCard,
  ProgressCard,
  AlertCard,
  DengueChartCard,
  DengueTrendChart,
  PieChart,
  DengueMapLegend,
  InterventionAnalysisChart
} from "../../components";
import PatternRecognitionResults from "@/components/Admin/PatternAlerts";
import PatternAlerts from "@/components/Admin/PatternAlerts";
import { useState, useRef, useEffect, useMemo } from "react";
import { useGetAnalyticsQuery, useGetPostsQuery, useGetAllInterventionsQuery, useGetPatternRecognitionResultsQuery, useGetBarangaysQuery } from '../../api/dengueApi';
import ActionRecommendationCard from "../../components/Admin/ActionRecommendationCard";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import DengueMap from "../../components/DengueMap";

// import { IconCheck, IconHourglassEmpty, IconSearch } from "@tabler/icons-react";

// Add the TABS array
const TABS = [
  { label: "Selected Barangay", value: "selected" },
  { label: "All Alerts", value: "all" },
  { label: "Spikes", value: "spikes" },
  { label: "Gradual Rise", value: "gradual" },
  { label: "Stability", value: "stability" },
  { label: "Decline", value: "decline" },
  { label: "No Pattern", value: "no_pattern" },
];

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Pattern color mapping for both border and badge
const PATTERN_COLORS = {
  spike: { border: 'border-error', badge: 'bg-error' },
  gradual_rise: { border: 'border-warning', badge: 'bg-warning' },
  stability: { border: 'border-info', badge: 'bg-info' },
  decline: { border: 'border-success', badge: 'bg-success' },
  low_level_activity: { border: 'border-gray-400', badge: 'bg-gray-400' },
  default: { border: 'border-gray-400', badge: 'bg-gray-400' }
};

const getPatternKey = (pattern) => {
  if (!pattern) return 'default';
  const p = pattern.trim().toLowerCase();
  if (p === 'spike') return 'spike';
  if (p === 'gradual_rise') return 'gradual_rise';
  if (p === 'stability') return 'stability';
  if (p === 'decline') return 'decline';
  if (p === 'low_level_activity') return 'low_level_activity';
  return 'default';
};

const getPatternBadgeColor = (pattern) => {
  if (!pattern) return 'border-gray-300';
  switch (pattern.toLowerCase()) {
    case 'spike':
      return 'border-error';
    case 'gradual_rise':
      return 'border-warning';
    case 'stability':
      return 'border-info';
    case 'decline':
      return 'border-success';
    case 'low_level_activity':
      return 'border-gray-300';
    default:
      return 'border-gray-300';
  }
};

const getPatternLabel = (pattern) => {
  if (!pattern) return 'No Pattern';
  switch (pattern.toLowerCase()) {
    case 'spike':
      return 'Spike';
    case 'gradual_rise':
      return 'Gradual Rise';
    case 'stability':
      return 'Stability';
    case 'decline':
      return 'Decline';
    case 'low_level_activity':
      return 'Low Level Activity';
    default:
      return 'No Pattern';
  }
};

const Analytics = () => {
  const [searchBarangay, setSearchBarangay] = useState(null); // for programmatic search
  const [mapSelectedBarangay, setMapSelectedBarangay] = useState(null); // for map selection
  const [initialBarangayNameForMap, setInitialBarangayNameForMap] = useState(null);
  const [selectedTab, setSelectedTab] = useState('selected');
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importError, setImportError] = useState("");
  const importModalRef = useRef(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");
  const { refetch: refetchAnalytics } = useGetAnalyticsQuery();
  const { refetch: refetchPosts } = useGetPostsQuery();
  const { refetch: refetchInterventions } = useGetAllInterventionsQuery();
  const [dataVersion, setDataVersion] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [showBreedingSites, setShowBreedingSites] = useState(true);
  const [showInterventions, setShowInterventions] = useState(true);
  const [importProgress, setImportProgress] = useState(0);

  const { data: patternResultsData, isLoading: isLoadingPatterns } = useGetPatternRecognitionResultsQuery();
  const { data: allInterventionsData, isLoading: isLoadingAllInterventions } = useGetAllInterventionsQuery();
  const { data: posts, isLoading: isLoadingPosts } = useGetPostsQuery();
  const { data: barangaysList, isLoading: isLoadingBarangays } = useGetBarangaysQuery();

  // Get the barangay with spike pattern and highest death cases
  const spikeRecommendationDetails = useMemo(() => {
    if (!barangaysList) return null;
    
    // Find all barangays with spike pattern
    const spikeBarangays = barangaysList.filter(barangay => 
      barangay.status_and_recommendation?.pattern_based?.status?.toLowerCase() === 'spike'
      );

    if (spikeBarangays.length === 0) return null;

    // Find the one with highest death cases
    const highestDeathBarangay = spikeBarangays.reduce((highest, current) => {
      const currentDeaths = current.status_and_recommendation?.death_priority?.count || 0;
      const highestDeaths = highest.status_and_recommendation?.death_priority?.count || 0;
      return currentDeaths > highestDeaths ? current : highest;
    }, spikeBarangays[0]);

    return {
      barangay: highestDeathBarangay.name,
      patternType: highestDeathBarangay.status_and_recommendation?.pattern_based?.status || 'no_pattern',
      pattern_based: highestDeathBarangay.status_and_recommendation?.pattern_based,
      report_based: highestDeathBarangay.status_and_recommendation?.report_based,
      death_priority: highestDeathBarangay.status_and_recommendation?.death_priority,
      last_analysis_time: highestDeathBarangay.last_analysis_time
    };
  }, [barangaysList]);

  // Update mapSelectedBarangay when spikeRecommendationDetails changes
  useEffect(() => {
    if (spikeRecommendationDetails) {
      setMapSelectedBarangay(spikeRecommendationDetails.barangay);
    }
  }, [spikeRecommendationDetails]);

  // Handle barangay selection from analytics UI (PatternAlerts, TrendChart, etc)
  const handleAnalyticsBarangaySelect = (barangayName) => {
    setSearchBarangay(barangayName);
    setMapSelectedBarangay(barangayName);
    setInitialBarangayNameForMap(barangayName);
  };

  // Handle barangay selection from map
  const handleMapBarangaySelect = (feature) => {
    if (feature?.properties?.name) {
    
      setMapSelectedBarangay(feature.properties.name);
      setSearchBarangay(null); // clear programmatic search
    }
  };

  // When InfoWindow is closed
  const handleMapInfoWindowClose = () => {
    setMapSelectedBarangay(null);
  };

  // Get filtered data for selected barangay
  const selectedNorm = mapSelectedBarangay?.toLowerCase().replace(/[^a-z0-9]/g, '');

  const filteredPosts = Array.isArray(posts?.posts) ? posts.posts.filter(post => {
    const postBarangayNorm = post.barangay?.toLowerCase().replace(/[^a-z0-9]/g, '');
    return postBarangayNorm === selectedNorm;
  }) : [];

  const filteredInterventions = allInterventionsData?.interventions?.filter(intervention => {
    const interventionBarangayNorm = intervention.barangay?.toLowerCase().replace(/[^a-z0-9]/g, '');
    return interventionBarangayNorm === selectedNorm;
  }) || [];

  const patternInfo = patternResultsData?.data?.find(
    item => item.name.toLowerCase() === mapSelectedBarangay?.toLowerCase()
  );

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      setImportError("");
    } else {
      setImportError("Please select a valid CSV file");
      setCsvFile(null);
    }
  };

  const handleImport = async () => {
    if (!csvFile) {
      setImportError("Please select a CSV file first");
      return;
    }
    setIsImporting(true);
    setImportError("");
    setImportProgress(0);

    try {
      // Step 1: Upload CSV (50% progress)
      const formData = new FormData();
      formData.append("file", csvFile);

      const response = await fetch("http://localhost:4000/api/v1/analytics/submit-csv-file", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to import CSV file");
      }

      const result = await response.json();
      setImportProgress(50); // Set to 50% after CSV upload

      // Step 2: Trigger dengue analysis (remaining 50% progress)
      const analysisResponse = await fetch("http://localhost:4000/api/v1/analytics/trigger-dengue-analysis", {
        method: "GET",
      });

      if (!analysisResponse.ok) {
        throw new Error("Failed to trigger dengue analysis");
      }

      setImportProgress(100); // Set to 100% after analysis is triggered
      setShowImportModal(false);
      setCsvFile(null);
      setImportError("");
      setUploadSuccessMessage("Dengue case data has been successfully imported and analyzed. The system has updated all risk assessments and pattern recognition for affected barangays.");
      setUploadedFileName(result.data?.file_info?.original_filename || "");
      setShowSuccessModal(true);
    } catch (error) {
      setImportError(error.message);
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  };

  return (
    <main className=" flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12  text-center md:justify-start md:text-left md:w-[48%] ">
        Analytics
      </p>
      <article className="flex flex-col gap-10">
        {/* <div className="mb-6 flex flex-col lg:flex-row gap-7 gap-y-10 shadow-sm p-6 rounded-lg">
          <section className="flex flex-7 flex-col gap-y-3">
            <p className="text-base-content text-4xl font-bold mb-2">
              Action Plans
            </p>
            <ActionPlanCard
              title="Scheduled"
              borderColor="border-l-warning"
              items={[
                { event: "Fogging in Barangay Payatas", date: "March 15" },
                {
                  event: "Awareness Seminar in Barangay Holy Spirit",
                  date: "March 15",
                },
              ]}
            />
            <ActionPlanCard
              title="Ongoing"
              borderColor="border-l-info"
              items={[
                { event: "Surveillance in Commonwealth" },
                {
                  event: "Clean-up Drive in Barangay Batasan Hills",
                },
              ]}
            />
            <ActionPlanCard
              title="Completed"
              borderColor="border-l-success"
              items={[
                { event: "Fogging in Barangay Tandang Sora", date: "March 2" },
                {
                  event: "Health Check-ups in Barangay Payatas",
                  date: "March 1",
                },
              ]}
            />
          </section>
          <section className="flex flex-9 flex-col gap-3 text-black">
            <p className="font-bold text-base-content text-4xl mb-2">
              Action Plans Progress
            </p>
            <ProgressCard
              title="Surveillance in Commonwealth"
              date="March 15"
              progress={50}
              statusColor="bg-info"
              items={[
                {
                  type: "done",
                  label: "Installed 3 monitoring cameras",
                },
                {
                  type: "result",
                  label: "Results: 80% decrease in mosquito larvae",
                },
                {
                  type: "pending",
                  label: "Data collection",
                },
              ]}
              onEdit={() => alert("Edit action triggered")}
            />
            <ProgressCard
              title="Awareness Seminar in Payatas"
              date="March 18"
              progress={80}
              statusColor="bg-success"
              items={[
                { type: "done", label: "Distributed 100 flyers" },
                { type: "done", label: "Hosted seminar with 50 attendees" },
                { type: "pending", label: "Post-event survey analysis" },
              ]}
              onEdit={() => console.log("Edit Awareness Progress")}
            />
            <ProgressCard
              title="Clean-Up Drive in Batasan"
              date="March 22"
              progress={30}
              statusColor="bg-warning"
              items={[
                { type: "done", label: "Cleared drainage in 3 zones" },
                { type: "result", label: "Initial improvement in water flow" },
                { type: "pending", label: "Debris disposal coordination" },
              ]}
              onEdit={() => console.log("Edit Cleanup Progress")}
            />
          </section>
        </div> */}
        {/* Recommendation Section */}
        {isLoadingPatterns && (
          <div className="w-full shadow-sm shadow-lg p-6 py-8 rounded-lg mt-6">
            <p className="text-base-content text-xl font-semibold">Loading recommendation...</p>
          </div>
        )}
        {!isLoadingPatterns && spikeRecommendationDetails && (
          <div className="w-full shadow-sm shadow-lg p-6 py-8 rounded-lg mt-6">
            {console.log('[Analytics DEBUG] spikeRecommendationDetails:', spikeRecommendationDetails)}
            <p className="text-base-content text-3xl font-bold mb-4">
              {spikeRecommendationDetails.patternType.toLowerCase() === 'spike'
                ? "Priority Action Recommendation (Spike Detected)"
                : `Action Recommendation for ${spikeRecommendationDetails.barangay}`
              }
            </p>
            <div className={`relative border-[2px] ${getPatternBadgeColor(spikeRecommendationDetails.patternType)} rounded-4xl p-4 pt-10 text-black`}>
              <p className={`absolute text-lg left-[-2px] top-[-6px] text-nowrap ${getPatternBadgeColor(spikeRecommendationDetails.patternType).replace('border-', 'bg-')} rounded-2xl font-semibold text-white p-1 px-4`}>
                {spikeRecommendationDetails.barangay}
              </p>

            
              {/* Alerts List */}
              <ul className="space-y-3 mt-2">
                {spikeRecommendationDetails.pattern_based?.alert && (
                  <li className="grid grid-cols-[24px_1fr] gap-2 items-center">
                    <ChartLineUp size={20} className="text-primary" />
                    <div>
                      <span className="font-bold text-primary">Pattern-Based:</span>
                      <span className="text-black ml-1">{spikeRecommendationDetails.pattern_based.alert.replace(spikeRecommendationDetails.barangay, spikeRecommendationDetails.barangay.charAt(0).toUpperCase() + spikeRecommendationDetails.barangay.slice(1).toLowerCase())}</span>
                    </div>
                  </li>
                )}
                {spikeRecommendationDetails.report_based && spikeRecommendationDetails.report_based.alert && spikeRecommendationDetails.report_based.alert.trim() !== '' && spikeRecommendationDetails.report_based.alert !== 'None' && (
                  <li className="grid grid-cols-[24px_1fr] gap-2 items-center">
                    <Warning size={20} className="text-warning" />
                    <div>
                      <span className="font-bold text-primary">Report-Based:</span>
                      <span className="text-black ml-1">{spikeRecommendationDetails.report_based.alert.replace(spikeRecommendationDetails.barangay, spikeRecommendationDetails.barangay.charAt(0).toUpperCase() + spikeRecommendationDetails.barangay.slice(1).toLowerCase())}</span>
                    </div>
                  </li>
                )}
                {spikeRecommendationDetails.death_priority?.alert && (
                  <li className="grid grid-cols-[24px_1fr] gap-2 items-center">
                    <div className="w-5 h-5 rounded-full bg-error mx-auto" />
                    <div>
                      <span className="font-bold text-primary">Death-Based:</span>
                      <span className="text-black ml-1">{spikeRecommendationDetails.death_priority.alert.replace(spikeRecommendationDetails.barangay, spikeRecommendationDetails.barangay.charAt(0).toUpperCase() + spikeRecommendationDetails.barangay.slice(1).toLowerCase())}</span>
                    </div>
                  </li>
                )}
              </ul>

              <div className="flex justify-end gap-2 mt-4">
                <button 
                  onClick={() => handleAnalyticsBarangaySelect(spikeRecommendationDetails.barangay)}
                  className="px-3 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors text-sm cursor-pointer"
                >
                  Select
                </button>
              </div>
            </div>
          </div>
        )}
        {!isLoadingPatterns && !spikeRecommendationDetails && mapSelectedBarangay && (
          <div className="w-full shadow-sm shadow-lg p-6 py-8 rounded-lg mt-6">
            <p className="text-base-content text-xl font-semibold">No spike recommendation available.</p>
          </div>
        )}
        <div className="flex flex-col gap-6 gap-y-12 lg:grid lg:grid-cols-12 shadow-sm shadow-lg p-6 py-8 rounded-lg">
          <section className="flex flex-col lg:col-span-7">
            <div className="flex justify-between items-center mb-4">
              <p className="text-base-content text-4xl font-bold">
                Trends and Patterns
              </p>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              > 
                <Upload size={20} />
                Import Dengue Cases
              </button>
            </div>

            <div className="mt-[-14px] ml-[-12px]">
              <DengueTrendChart
                selectedBarangay={mapSelectedBarangay}
                onBarangayChange={handleAnalyticsBarangaySelect}
                key={dataVersion}
              />
            </div>
          </section>

          <section className="flex flex-col lg:col-span-5 gap-y-5">
            <p className="mb-2 text-base-content text-4xl font-bold">
              Pattern Recognition Alerts
            </p>
            {/* TABS */}
            <div className="flex flex-wrap gap-2 mb-4">
              {TABS.map(tab => (
                <button
                  key={tab.value}
                  className={`px-3 py-1 rounded-full ${selectedTab === tab.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-black'
                    }`}
                  onClick={() => setSelectedTab(tab.value)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-y-5 h-95 xl:h-120 2xl:h-125 mt-[-10px] py-3 overflow-y-scroll">
              <PatternAlerts
                selectedBarangay={mapSelectedBarangay}
                selectedTab={selectedTab}
                onAlertSelect={handleAnalyticsBarangaySelect}
                key={dataVersion}
              />
            </div>
          </section>
        </div>
        <div className="w-full flex flex-col  shadow-sm shadow-lg p-6 py-8 rounded-lg">
          <p className="mb-4 text-base-content text-4xl font-bold">Mapping</p>
          <p className="text-base-content text-xl font-semibold mb-6">
            Barangay Dengue Risk and Case Density Map
          </p>
          <div className="rounded-xl shadow-sm h-140 overflow-hidden">
            {isLoadingBarangays ? (
              <div className="flex items-center justify-center h-full">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : !barangaysList ? (
              <div className="flex items-center justify-center h-full text-error">
                Error loading barangay data
              </div>
            ) : (
              <DengueMap
                showLegends={true}
                defaultTab="cases"
                key={dataVersion}
                initialFocusBarangayName={initialBarangayNameForMap}
                searchQuery={searchBarangay}
                selectedBarangay={mapSelectedBarangay}
                activeInterventions={allInterventionsData}
                isLoadingInterventions={isLoadingAllInterventions}
                barangaysList={barangaysList}
                onBarangaySelect={handleMapBarangaySelect}
                onInfoWindowClose={handleMapInfoWindowClose}
                showBreedingSites={showBreedingSites}
                showInterventions={showInterventions}
                onToggleBreedingSites={() => setShowBreedingSites(!showBreedingSites)}
                onToggleInterventions={() => setShowInterventions(!showInterventions)}
              />
            )}
          </div>
        </div>
        {/* Selected Barangay Analytics Section */}
        <div className="w-full flex flex-col shadow-sm shadow-lg p-6 py-8 rounded-lg mt-6">
          <p className="mb-4 text-base-content text-3xl font-bold">Selected Barangay Analytics</p>
          {mapSelectedBarangay ? (
            (() => {
              // Normalize barangay name for matching
              const normalize = (name) => (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              const selectedNorm = normalize(mapSelectedBarangay);
              // Reports analytics
              const filteredPosts = Array.isArray(posts?.posts) ? posts.posts.filter(post => normalize(post.barangay) === selectedNorm) : [];

              const validatedCount = Array.isArray(filteredPosts) ? filteredPosts.filter(p => p.status === 'Validated').length : 0;
              const pendingCount = Array.isArray(filteredPosts) ? filteredPosts.filter(p => p.status === 'Pending').length : 0;
              const rejectedCount = Array.isArray(filteredPosts) ? filteredPosts.filter(p => p.status === 'Rejected').length : 0;

              // Interventions analytics
              const filteredInterventions = Array.isArray(allInterventionsData?.interventions)
                ? allInterventionsData.interventions.filter(i => normalize(i.barangay) === selectedNorm)
                : [];

              const totalInterventions = filteredInterventions.length;
              const scheduledInterventions = filteredInterventions.filter(i => (i.status || '').toLowerCase() === 'scheduled').length;
              const ongoingInterventions = filteredInterventions.filter(i => (i.status || '').toLowerCase() === 'ongoing').length;
              const completedInterventions = filteredInterventions.filter(i => ['completed', 'complete'].includes((i.status || '').toLowerCase())).length;

              // Bar chart data for reports
              const reportsBarData = {
                labels: ['Validated', 'Pending', 'Rejected'],
                datasets: [
                  {
                    label: 'Reports',
                    data: [validatedCount, pendingCount, rejectedCount],
                    backgroundColor: [
                      'rgba(34,197,94,0.7)', // green
                      'rgba(234,179,8,0.7)', // yellow
                      'rgba(239,68,68,0.7)'  // red
                    ],
                  },
                ],
              };
              const reportsBarOptions = {
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: 'Reports Status' },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    precision: 0,
                    ticks: {
                      stepSize: 1,
                      callback: function (value) {
                        return Number.isInteger(value) ? value : null;
                      }
                    }
                  }
                }
              };

              // Bar chart data for interventions
              const interventionsBarData = {
                labels: ['Scheduled', 'Ongoing', 'Completed', 'Total'],
                datasets: [
                  {
                    label: 'Interventions',
                    data: [scheduledInterventions, ongoingInterventions, completedInterventions, totalInterventions],
                    backgroundColor: [
                      'rgba(139,92,246,0.7)', // purple (scheduled)
                      'rgba(59,130,246,0.7)', // blue (ongoing)
                      'rgba(34,197,94,0.7)', // green (completed)
                      'rgba(107,114,128,0.7)' // gray (total)
                    ],
                  },
                ],
              };
              const interventionsBarOptions = {
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: { display: true, text: 'Interventions Status' },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    precision: 0,
                    ticks: {
                      stepSize: 1,
                      callback: function (value) {
                        return Number.isInteger(value) ? value : null;
                      }
                    }
                  }
                }
              };

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Reports Bar Chart */}
                  <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-primary/20">
                    <p className="font-bold text-lg text-primary mb-2">Reports</p>
                    <div className="h-48">
                      {filteredPosts.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
                      ) : (
                        <Bar data={reportsBarData} options={reportsBarOptions} />
                      )}
                    </div>
                  </div>
                  {/* Interventions Bar Chart */}
                  <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-primary/20">
                    <p className="font-bold text-lg text-primary mb-2">Interventions</p>
                    <div className="h-48">
                      {filteredInterventions.length === 0 || (scheduledInterventions === 0 && ongoingInterventions === 0 && completedInterventions === 0 && totalInterventions === 0) ? (
                        <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
                      ) : (
                        <Bar data={interventionsBarData} options={interventionsBarOptions} />
                      )}
                    </div>
                  </div>
                  {/* Pattern Recognition Card */}
                  {/* <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2 border border-primary/20">
                    <p className="font-bold text-lg text-primary mb-2">Pattern Recognition</p>
                    {patternInfo ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold">Pattern: <span className="capitalize">{patternInfo.triggered_pattern || 'None'}</span></span>
                        <span className="font-semibold">Alert: {patternInfo.alert || 'No recent data'}</span>
                        <span className="font-semibold">Last Analyzed: {patternInfo.last_analysis_time ? new Date(patternInfo.last_analysis_time).toLocaleString() : 'N/A'}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">No pattern data available.</span>
                    )}
                  </div> */}
                </div>
              );
            })()
          ) : (
            <p className="text-gray-500 italic">No barangay selected. Select a barangay to view analytics.</p>
          )}
        </div>
      </article>

      {/* Import Modal */}
      <dialog ref={importModalRef} className="modal" open={showImportModal}>
        <div className="modal-box bg-white rounded-3xl shadow-3xl w-9/12 max-w-2xl p-8">
          <p className="text-3xl font-extrabold mb-4">Import Dengue Cases</p>
          <div className="mb-4">
            <p className="text-md text-primary mb-2">Select a CSV file containing dengue case data for analysis.</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input file-input-bordered  w-full"
            />
            {importError && (
              <p className="text-error mt-2">{importError}</p>
            )}
            {isImporting && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-6">
                  <div 
                    className="bg-primary h-6 rounded-full transition-all duration-300" 
                    style={{ width: `${importProgress}%` }}
                  ></div>
                </div>
                <p className="text-md text-gray-600 mt-3">
                  {importProgress < 50 ? "Uploading CSV file..." : "Analyzing dengue data..."}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowImportModal(false);
                setCsvFile(null);
                setImportError("");
                setImportProgress(0);
              }}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="btn btn-primary"
              disabled={!csvFile || isImporting}
            >
              {isImporting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  {importProgress}%
                </>
              ) : (
                "Import"
              )}
            </button>
          </div>
        </div>
      </dialog>
      {/* Success Modal */}
      <dialog open={showSuccessModal} className="modal">
        <div className="modal-box bg-white rounded-3xl shadow-3xl w-9/12 max-w-3xl p-8 flex flex-col items-center">
          <div className="text-green-600 mb-2">
            <Check size={48} />
          </div>
          <p className="text-2xl text-center font-semibold mb-4 ">{uploadSuccessMessage}</p>
          {uploadedFileName && (
            <p className="text-lg text-gray-700 mb-4">File: <span className="font-semibold">{uploadedFileName}</span></p>
          )}
          <button
            className="btn btn-primary mt-2"
            onClick={() => { setShowSuccessModal(false); window.location.reload(); }}
          >
            Close
          </button>
        </div>
      </dialog>


    </main>
  );
};

export default Analytics;
