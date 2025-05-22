import { Check, Upload } from "phosphor-react";
import { alerts } from "../../utils";
import {
  ActionPlanCard,
  ProgressCard,
  AlertCard,
  DengueChartCard,
  DengueTrendChart,
  DengueMap,
  PieChart,
  DengueMapLegend,
  InterventionAnalysisChart
} from "../../components";
import PatternRecognitionResults from "@/components/Admin/PatternAlerts";
import PatternAlerts from "@/components/Admin/PatternAlerts";
import { useState, useRef, useEffect } from "react";
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

// import { IconCheck, IconHourglassEmpty, IconSearch } from "@tabler/icons-react";

// Add the TABS array
const TABS = [
  { label: "Selected Barangay", value: "selected" },
  { label: "All Alerts", value: "all" },
  { label: "Spikes", value: "spikes" },
  { label: "Gradual Rise", value: "gradual" },
  { label: "Stability", value: "stability" },
  { label: "Decline", value: "decline" },
];

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Analytics = () => {
  const [selectedBarangay, setSelectedBarangay] = useState(null);
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
  const [spikeRecommendationDetails, setSpikeRecommendationDetails] = useState(null);

  const { data: patternResultsData, isLoading: isLoadingPatterns } = useGetPatternRecognitionResultsQuery();
  const { data: allInterventionsData, isLoading: isLoadingAllInterventions } = useGetAllInterventionsQuery();
  const { data: posts, isLoading: isLoadingPosts } = useGetPostsQuery();
  const { data: barangaysList, isLoading: isLoadingBarangays } = useGetBarangaysQuery();

  useEffect(() => {
    if (patternResultsData?.data && !initialBarangayNameForMap) {
      // Find barangays with spike patterns
      const spikeBarangays = patternResultsData.data.filter(item =>
        item.pattern?.toLowerCase() === 'spike'
      );

      let targetBarangayName;

      if (spikeBarangays.length > 0) {
        // If we have spike patterns, select the first one
        targetBarangayName = spikeBarangays[0].name;
      } else {
        // Fallback to first barangay in the list
        targetBarangayName = patternResultsData.data[0]?.name;
      }

      if (targetBarangayName) {
        const patternInfo = patternResultsData.data.find(
          item => item.name === targetBarangayName
        );

        const recommendationDetails = {
          barangay: targetBarangayName,
          patternType: patternInfo?.pattern || 'none',
          issueDetected: patternInfo?.alert || 'N/A',
          suggestedAction: patternInfo?.recommendation || 'No specific recommendation available.'
        };

        setSelectedBarangay(targetBarangayName);
        setInitialBarangayNameForMap(targetBarangayName);
        setSpikeRecommendationDetails(recommendationDetails);
      }
    }
  }, [patternResultsData, initialBarangayNameForMap]);

  // Handle barangay selection from map
  const handleBarangaySelect = (barangayFeature) => {
    if (barangayFeature?.properties?.name) {
      setSelectedBarangay(barangayFeature.properties.name);
    }
  };

  // Get filtered data for selected barangay
  const selectedNorm = selectedBarangay?.toLowerCase().replace(/[^a-z0-9]/g, '');

  const filteredPosts = posts?.filter(post => {
    const postBarangayNorm = post.barangay?.toLowerCase().replace(/[^a-z0-9]/g, '');
    return postBarangayNorm === selectedNorm;
  }) || [];

  const filteredInterventions = allInterventionsData?.filter(intervention => {
    const interventionBarangayNorm = intervention.barangay?.toLowerCase().replace(/[^a-z0-9]/g, '');
    return interventionBarangayNorm === selectedNorm;
  }) || [];

  const patternInfo = patternResultsData?.data?.find(
    item => item.name.toLowerCase() === selectedBarangay?.toLowerCase()
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

    try {
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
      setShowImportModal(false);
      setCsvFile(null);
      setImportError("");
      setUploadSuccessMessage(result.message || "CSV uploaded successfully!");
      setUploadedFileName(result.data?.file_info?.original_filename || "");
      setShowSuccessModal(true);
    } catch (error) {
      setImportError(error.message);
    } finally {
      setIsImporting(false);
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
            <p className="text-base-content text-3xl font-bold mb-4">
              {spikeRecommendationDetails.patternType.toLowerCase() === 'spike'
                ? "Priority Action Recommendation (Spike Detected)"
                : `Action Recommendation for ${spikeRecommendationDetails.barangay}`
              }
            </p>
            {/* {console.log("[Analytics DEBUG] Rendering ActionRecommendationCard with props:", JSON.stringify(spikeRecommendationDetails, null, 2))} */}
            <ActionRecommendationCard
              barangay={spikeRecommendationDetails.barangay}
              patternType={spikeRecommendationDetails.patternType}
              issueDetected={spikeRecommendationDetails.issueDetected}
              suggestedAction={spikeRecommendationDetails.suggestedAction}
            />
          </div>
        )}
        {!isLoadingPatterns && !spikeRecommendationDetails && selectedBarangay && (
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
                Import CSV
              </button>
            </div>

            <div className="mt-[-14px] ml-[-12px]">
              <DengueTrendChart
                selectedBarangay={selectedBarangay}
                onBarangayChange={(barangayName) => {
                  setSelectedBarangay(barangayName);
                  setInitialBarangayNameForMap(barangayName);
                }}
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
                selectedBarangay={selectedBarangay}
                selectedTab={selectedTab}
                onAlertSelect={(barangayName) => {
                  setSelectedBarangay(barangayName);
                  setInitialBarangayNameForMap(barangayName);
                }}
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
                searchQuery={selectedBarangay}
                activeInterventions={allInterventionsData}
                isLoadingInterventions={isLoadingAllInterventions}
                barangaysList={barangaysList}
                onBarangaySelect={handleBarangaySelect}
              />
            )}
          </div>
        </div>
        {/* Selected Barangay Analytics Section */}
        <div className="w-full flex flex-col shadow-sm shadow-lg p-6 py-8 rounded-lg mt-6">
          <p className="mb-4 text-base-content text-3xl font-bold">Selected Barangay Analytics</p>
          {selectedBarangay ? (
            (() => {
              // Normalize barangay name for matching
              const normalize = (name) => (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              const selectedNorm = normalize(selectedBarangay);

              // Reports analytics
              const filteredPosts = Array.isArray(posts)
                ? posts.filter(post => normalize(post.barangay) === selectedNorm)
                : [];

              const validatedCount = filteredPosts.filter(p => p.status === 'Validated').length;
              const pendingCount = filteredPosts.filter(p => p.status === 'Pending').length;
              const rejectedCount = filteredPosts.filter(p => p.status === 'Rejected').length;

              // Interventions analytics
              const filteredInterventions = Array.isArray(allInterventionsData)
                ? allInterventionsData.filter(i => normalize(i.barangay) === selectedNorm)
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
          <h3 className="text-2xl font-bold mb-4">Import Dengue Cases</h3>
          <div className="mb-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full"
            />
            {importError && (
              <p className="text-error mt-2">{importError}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowImportModal(false);
                setCsvFile(null);
                setImportError("");
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
                  Importing...
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
        <div className="modal-box bg-white rounded-3xl shadow-3xl w-9/12 max-w-md p-8 flex flex-col items-center">
          <div className="text-green-600 mb-2">
            <Check size={48} />
          </div>
          <h3 className="text-2xl font-bold mb-2">{uploadSuccessMessage}</h3>
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
