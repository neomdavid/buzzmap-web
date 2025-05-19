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
import { useGetAnalyticsQuery, useGetPostsQuery, useGetAllInterventionsQuery, useGetPatternRecognitionResultsQuery } from '../../api/dengueApi';
import ActionRecommendationCard from "../../components/Admin/ActionRecommendationCard";

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

  useEffect(() => {
    console.log("[Analytics DEBUG] patternResultsData:", JSON.stringify(patternResultsData, null, 2));
    console.log("[Analytics DEBUG] isLoadingPatterns:", isLoadingPatterns);
    console.log("[Analytics DEBUG] initialBarangayNameForMap (before logic):", initialBarangayNameForMap);
  }, [patternResultsData, isLoadingPatterns, initialBarangayNameForMap]);

  // Effect to set initial selected barangay based on spike pattern
  useEffect(() => {
    console.log("[Analytics DEBUG] Entering initial barangay selection effect. patternResultsData exists:", !!patternResultsData?.data, "initialBarangayNameForMap:", initialBarangayNameForMap);
    if (patternResultsData?.data && !initialBarangayNameForMap) { 
      console.log("[Analytics DEBUG] Finding spike barangays from:", patternResultsData.data);
      const spikeBarangays = patternResultsData.data.filter(
        item => item.triggered_pattern?.toLowerCase() === 'spike'
      );
      console.log(`[Analytics DEBUG] Found ${spikeBarangays.length} spike barangay(s):`, JSON.stringify(spikeBarangays, null, 2));

      let targetBarangay = null;
      let recommendationDetails = null;

      if (spikeBarangays.length > 0) {
        // Sort spikes: most recent first, then alphabetically by name
        spikeBarangays.sort((a, b) => {
          const timeA = new Date(a.last_analysis_time || 0);
          const timeB = new Date(b.last_analysis_time || 0);
          if (timeB !== timeA) {
            return timeB - timeA;
          }
          return a.name.localeCompare(b.name);
        });
        targetBarangay = spikeBarangays[0]; // Select the top one after sorting
        setSelectedTab('spikes'); // Switch tab to show all spikes if any exist
        console.log("[Analytics DEBUG] Selected 'spikes' tab due to existing spike patterns.");
      } else {
        // No spikes, fallback to default behavior (first barangay or hardcoded)
        targetBarangay = patternResultsData.data?.[0];
        if (!targetBarangay) {
          targetBarangay = { name: 'bahay toro' }; // Ensure targetBarangay is an object for consistency
        }
         setSelectedTab('selected'); // Keep 'selected' or switch to 'all' if preferred
      }
      
      if (targetBarangay) {
        const targetBarangayName = targetBarangay.name;
        // Fetch details for the chosen targetBarangay, even if it's not a spike (for fallback)
        const fullDetailsForTarget = patternResultsData.data.find(p => p.name === targetBarangayName);

        if (fullDetailsForTarget && fullDetailsForTarget.triggered_pattern) { // Check if pattern exists for recommendation
            recommendationDetails = {
                barangay: fullDetailsForTarget.name,
                patternType: fullDetailsForTarget.triggered_pattern,
                issueDetected: fullDetailsForTarget.alert?.replace(/^[^:]+:\s*/, ''),
                suggestedAction: fullDetailsForTarget.current_recommendation?.full_recommendation,
            };
        } else {
            // Handle case where even the fallback targetBarangay might not have full details or pattern
            recommendationDetails = {
                barangay: targetBarangayName,
                patternType: 'none', // Default pattern type
                issueDetected: 'N/A',
                suggestedAction: 'No specific recommendation available.',
            };
             if (!fullDetailsForTarget) { // If targetBarangay was the hardcoded 'bahay toro'
                console.log("[Analytics DEBUG] Fallback to hardcoded 'bahay toro', no detailed pattern data found for it.");
             }
        }
        
        console.log("[Analytics DEBUG] Target Barangay for map and chart:", targetBarangayName);
        console.log("[Analytics DEBUG] Recommendation Details for display:", JSON.stringify(recommendationDetails, null, 2));

        setSelectedBarangay(targetBarangayName); 
        setInitialBarangayNameForMap(targetBarangayName);
        setSpikeRecommendationDetails(recommendationDetails);
        console.log("[Analytics DEBUG] States set - selectedBarangay:", targetBarangayName, "initialBarangayNameForMap:", targetBarangayName);
      }
    }
  }, [patternResultsData, initialBarangayNameForMap]);

  // Handler to change selected barangay from PatternAlerts
  const handleAlertBarangaySelect = (barangayName) => {
    setSelectedBarangay(barangayName);
    setSelectedTab('selected'); // Switch tab to show the selected barangay's alert
    // Optionally, scroll to the chart or highlight it
    // e.g., document.getElementById('trends-chart-section')?.scrollIntoView({ behavior: 'smooth' });
  };

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
      <article className="flex flex-col">
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
                onBarangayChange={setSelectedBarangay}
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
                  className={`px-3 py-1 rounded-full ${
                    selectedTab === tab.value 
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
                onAlertSelect={handleAlertBarangaySelect}
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
            {console.log("[Analytics DEBUG] Rendering DengueMap with initialFocusBarangayName:", initialBarangayNameForMap)}
            <DengueMap 
              showLegends={true} 
              defaultTab="cases"
              key={dataVersion}
              initialFocusBarangayName={initialBarangayNameForMap}
              activeInterventions={allInterventionsData}
              isLoadingInterventions={isLoadingAllInterventions}
            />
          </div>
        </div>
        <PieChart />
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
          {console.log("[Analytics DEBUG] Rendering ActionRecommendationCard with props:", JSON.stringify(spikeRecommendationDetails, null, 2))}
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
    </main>
  );
};

export default Analytics;
