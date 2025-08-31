import { useState, useMemo } from "react";
import {
  useGetBarangaysQuery,
  useGetPatternRecognitionResultsQuery,
  useGenerateRecommendationMutation,
} from "../../api/dengueApi";
import { MagnifyingGlass } from "phosphor-react";
import AlertCard from "./AlertCard";
import RecommendationModal from "./RecommendationModal";
import {
  PATTERN_TAB_VALUES,
  normalizePatternType,
} from "../../utils/patternConfig";

export default function PatternAlerts({
  selectedBarangay,
  selectedTab,
  onAlertSelect,
}) {
  const { data: barangaysData, isLoading, error } = useGetBarangaysQuery();
  const { data: patternResultsData, isLoading: patternResultsLoading } =
    useGetPatternRecognitionResultsQuery();
  const [generateRecommendation, { isLoading: isGeneratingRecommendation }] =
    useGenerateRecommendationMutation();

  // State for AI recommendations
  const [aiRecommendations, setAiRecommendations] = useState({});
  const [recommendationLoading, setRecommendationLoading] = useState({});
  const [recommendationError, setRecommendationError] = useState({});
  const [showDetailedRecommendations, setShowDetailedRecommendations] =
    useState(false);

  // Function to generate AI recommendation for a barangay
  const handleGenerateRecommendation = async (barangayName) => {
    if (aiRecommendations[barangayName]) {
      return; // Already generated
    }

    setRecommendationLoading((prev) => ({ ...prev, [barangayName]: true }));
    setRecommendationError((prev) => ({ ...prev, [barangayName]: null }));
    setShowDetailedRecommendations(false); // Reset to show summary only

    try {
      const response = await generateRecommendation({
        userRole: "admin",
        barangay: barangayName,
      }).unwrap();

      // The API returns the data directly, no need to check for success
      if (response && response.recommendation) {
        setAiRecommendations((prev) => ({
          ...prev,
          [barangayName]: response,
        }));
      }
    } catch (error) {
      console.error("Failed to generate recommendation:", error);
      const message =
        error?.data?.message ||
        error?.error ||
        error?.message ||
        "Unknown error";
      setRecommendationError((prev) => ({ ...prev, [barangayName]: message }));
    } finally {
      setRecommendationLoading((prev) => ({ ...prev, [barangayName]: false }));
    }
  };

  // Merge pattern data with barangay data (now only barangaysData)
  const patternData = useMemo(() => {
    if (!barangaysData) return [];

    const processedData = barangaysData.map((barangay) => {
      const patternBased = barangay.status_and_recommendation?.pattern_based;
      const reportBased = barangay.status_and_recommendation?.report_based;
      const deathPriority = barangay.status_and_recommendation?.death_priority;

      return {
        _id: barangay._id,
        name: barangay.name,
        pattern_based: patternBased,
        report_based: reportBased,
        death_priority: deathPriority,
        pattern_data: barangay.pattern_data,
        last_analysis_time: barangay.last_analysis_time,
      };
    });

    return processedData;
  }, [barangaysData]);

  // Filter alerts based on selected tab
  const filteredAlerts = useMemo(() => {
    if (!patternResultsData?.data) {
      return [];
    }

    const filtered = patternResultsData.data.filter((item) => {
      const pattern = normalizePatternType(item.pattern);

      let shouldInclude = false;
      switch (selectedTab) {
        case PATTERN_TAB_VALUES.SELECTED:
          shouldInclude =
            item.name.toLowerCase() === selectedBarangay?.toLowerCase();
          break;
        case PATTERN_TAB_VALUES.ALL:
          shouldInclude = true;
          break;
        case PATTERN_TAB_VALUES.SPIKES:
          shouldInclude = pattern === "spike";
          break;
        case PATTERN_TAB_VALUES.INCREASE:
          shouldInclude = pattern === "increase";
          break;
        case PATTERN_TAB_VALUES.DECREASE:
          shouldInclude = pattern === "decrease";
          break;
        case PATTERN_TAB_VALUES.LOW_LEVEL_ACTIVITY:
          shouldInclude = pattern === "low_level_activity";
          break;
        case PATTERN_TAB_VALUES.NO_CHANGE:
          shouldInclude = pattern === "no_change";
          break;
        default:
          shouldInclude = true;
      }

      return shouldInclude;
    });

    return filtered;
  }, [patternResultsData, selectedTab, selectedBarangay]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-error p-4">
        Error loading pattern alerts: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <MagnifyingGlass
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Search barangays..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Alerts Grid */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pattern alerts found for the selected criteria.
        </div>
      ) : (
        filteredAlerts.map((item) => {
          const barangayData = barangaysData?.find((b) => b.name === item.name);

          return (
            <div key={item.name}>
              <AlertCard
                title={item.name}
                pattern_based={
                  barangayData?.status_and_recommendation?.pattern_based
                }
                report_based={
                  barangayData?.status_and_recommendation?.report_based
                }
                death_priority={
                  barangayData?.status_and_recommendation?.death_priority
                }
                pattern_data={{
                  pattern: item.pattern,
                  alert: item.alert,
                  recommendation: item.recommendation,
                }}
                last_analysis_time={barangayData?.last_analysis_time}
                barangayName={item.name}
                onSelect={onAlertSelect}
                aiRecommendations={aiRecommendations}
                recommendationLoading={recommendationLoading}
                onGenerateRecommendation={handleGenerateRecommendation}
                setRecommendationLoading={setRecommendationLoading}
              />

              {/* Recommendation Modal */}
              <RecommendationModal
                key={`modal-${item.name}`}
                barangayName={item.name}
                pattern_based={
                  barangayData?.status_and_recommendation?.pattern_based
                }
                pattern_data={{
                  pattern: item.pattern,
                  alert: item.alert,
                  recommendation: item.recommendation,
                }}
                death_priority={
                  barangayData?.status_and_recommendation?.death_priority
                }
                aiRecommendations={aiRecommendations}
                recommendationLoading={recommendationLoading}
                recommendationError={recommendationError}
                showDetailedRecommendations={showDetailedRecommendations}
                setShowDetailedRecommendations={setShowDetailedRecommendations}
                onGenerateRecommendation={handleGenerateRecommendation}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
