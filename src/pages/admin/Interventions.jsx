import { Link } from "react-router-dom"; // Import Link for navigation
import {
  InterventionsTable,
  // FormCoordinationRequest, // Commented out as it's not used in the current visible layout
  ActionRecommendationCard,
} from "../../components";
import {
  useGetAllInterventionsQuery,
  useGetPostsQuery,
  useGetBarangaysQuery,
} from "../../api/dengueApi";
import { Bar, Pie } from "react-chartjs-2"; // Pie and Bar will be removed from render
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import {
  IconChecks,
  IconMapPins,
  IconTag,
  IconListDetails,
  IconChevronRight,
  IconChevronLeft,
} from "@tabler/icons-react"; // Replaced IconFileDescription with IconListDetails
import { Circle, Lightbulb } from "phosphor-react";
import dayjs from "dayjs"; // Import dayjs
import { useEffect, useState } from "react"; // Import useState
import React from "react";
import AddInterventionModal from "../../components/Admin/AddInterventionModal";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Interventions = () => {
  const {
    data: interventions,
    isLoading: isLoadingInterventions,
    error: errorInterventions,
  } = useGetAllInterventionsQuery();
  const {
    data: posts,
    isLoading: isLoadingPosts,
    error: errorPosts,
  } = useGetPostsQuery();

  // Fetch pattern recognition results
  const {
    data: barangaysList,
    isLoading: isLoadingBarangays,
    error: errorBarangays,
  } = useGetBarangaysQuery();

  // Log the raw API response data and transform it
  const transformedBarangays = React.useMemo(() => {
    if (!barangaysList) return [];

    console.log(
      "[DEBUG] Raw Barangays List:",
      JSON.stringify(barangaysList, null, 2)
    );

    return barangaysList.map((b) => {
      const patternBased = b.status_and_recommendation?.pattern_based || {};
      const reportBased = b.status_and_recommendation?.report_based || {};
      const deathBased = b.status_and_recommendation?.death_priority || {};

      return {
        name: b.name,
        patternType: patternBased.status?.toLowerCase() || "none",
        issueDetected: patternBased.alert || "",
        suggestedAction:
          patternBased.admin_recommendation ||
          patternBased.recommendation ||
          "",
        report_based: {
          count: reportBased.count || 0,
          alert: reportBased.alert || "",
          recommendation: reportBased.recommendation || "",
        },
        death_priority: {
          count: deathBased.count || 0,
          alert: deathBased.alert || "",
          recommendation: deathBased.recommendation || "",
        },
      };
    });
  }, [barangaysList]);

  // Log the transformed data
  useEffect(() => {
    if (transformedBarangays.length > 0) {
      console.log(
        "[DEBUG] Transformed Barangays List:",
        JSON.stringify(transformedBarangays, null, 2)
      );
    }
  }, [transformedBarangays]);

  const completedInterventions = interventions
    ? interventions.filter((i) => {
        const status = i.status?.toLowerCase();
        return status === "completed" || status === "complete";
      })
    : [];

  // Calculate completed interventions for the current month
  const currentMonth = dayjs().month();
  const currentYear = dayjs().year();
  const completedThisMonthCount = completedInterventions.filter((i) => {
    const interventionDate = dayjs(i.date);
    return (
      interventionDate.month() === currentMonth &&
      interventionDate.year() === currentYear
    );
  }).length;

  const barangaySet = new Set(completedInterventions.map((i) => i.barangay));
  const totalBarangays = barangaySet.size;

  const typeCounts = completedInterventions.reduce((acc, i) => {
    acc[i.interventionType] = (acc[i.interventionType] || 0) + 1;
    return acc;
  }, {});
  const mostCommonTypeEntry = Object.entries(typeCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const mostCommonType = mostCommonTypeEntry ? mostCommonTypeEntry[0] : "-";

  const barangayCounts = completedInterventions.reduce((acc, i) => {
    // This will be unused if Bar chart is removed
    acc[i.barangay] = (acc[i.barangay] || 0) + 1;
    return acc;
  }, {});

  const totalInterventionsAllStatuses = interventions
    ? interventions.length
    : 0;

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

  const [recommendationSearchQuery, setRecommendationSearchQuery] =
    useState("");
  const [patternFilter, setPatternFilter] = useState(""); // Empty string for "All Patterns"

  // Get unique pattern types for the filter dropdown (from barangaysList)
  const uniquePatternTypes = React.useMemo(() => {
    if (!transformedBarangays) return [];
    const patterns = new Set(
      transformedBarangays
        .map((b) => b.patternType)
        .filter(Boolean)
        .map((s) => s.toLowerCase())
    );
    return Array.from(patterns).sort();
  }, [transformedBarangays]);

  // Add this helper function at the top level
  const isWithinTwoWeeks = (dateStr) => {
    const today = new Date();
    const interventionDate = new Date(dateStr);
    const twoWeeksAgo = new Date(today);
    twoWeeksAgo.setDate(today.getDate() - 14);
    const twoWeeksAhead = new Date(today);
    twoWeeksAhead.setDate(today.getDate() + 14);

    return interventionDate >= twoWeeksAgo && interventionDate <= twoWeeksAhead;
  };

  // Update the filteredRecommendations logic
  const filteredRecommendations = React.useMemo(() => {
    if (!transformedBarangays) return [];

    // Get all interventions for each barangay
    const barangayInterventions = interventions
      ? interventions.reduce((acc, intervention) => {
          if (!acc[intervention.barangay]) {
            acc[intervention.barangay] = [];
          }
          acc[intervention.barangay].push(intervention);
          return acc;
        }, {})
      : {};

    let recommendations = transformedBarangays
      .filter((item) => {
        // Show item if it has any of these:
        // 1. Pattern-based alert or recommendation
        // 2. Death-based alert, recommendation, or count
        return (
          (item.issueDetected && item.issueDetected.toLowerCase() !== "none") ||
          (item.suggestedAction && item.suggestedAction.trim() !== "") ||
          item.death_priority.count > 0 ||
          (item.death_priority.alert &&
            item.death_priority.alert.trim() !== "") ||
          (item.death_priority.recommendation &&
            item.death_priority.recommendation.trim() !== "")
        );
      })
      // Sort by death count first (descending), then by pattern type
      .sort((a, b) => {
        // First sort by death count
        if (a.death_priority.count !== b.death_priority.count) {
          return b.death_priority.count - a.death_priority.count;
        }
        // If death counts are equal, sort by pattern type (spike first, then gradual_rise, etc.)
        const patternOrder = {
          spike: 0,
          gradual_rise: 1,
          stability: 2,
          decline: 3,
          none: 4,
        };
        return patternOrder[a.patternType] - patternOrder[b.patternType];
      });

    // Apply pattern filter
    if (patternFilter) {
      recommendations = recommendations.filter(
        (item) => item.patternType === patternFilter.toLowerCase()
      );
    }

    // Apply search query
    if (recommendationSearchQuery) {
      const searchQueryLower = recommendationSearchQuery.toLowerCase();
      recommendations = recommendations.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchQueryLower) ||
          item.issueDetected?.toLowerCase().includes(searchQueryLower) ||
          item.suggestedAction?.toLowerCase().includes(searchQueryLower) ||
          item.patternType?.toLowerCase().includes(searchQueryLower) ||
          (item.death_priority.alert &&
            item.death_priority.alert.toLowerCase().includes(searchQueryLower))
      );
    }

    // Add intervention status to each recommendation
    recommendations = recommendations.map((item) => {
      const barangayInterventionsList = barangayInterventions[item.name] || [];
      const recentInterventions = barangayInterventionsList.filter(
        (intervention) => isWithinTwoWeeks(intervention.date)
      );

      return {
        ...item,
        recentInterventions,
        hasValidIntervention: recentInterventions.length > 0,
      };
    });

    return recommendations;
  }, [
    transformedBarangays,
    patternFilter,
    recommendationSearchQuery,
    interventions,
  ]);

  // Log what is being rendered in ActionRecommendationCard for debugging
  console.log("ActionRecommendationCard data:", filteredRecommendations);

  // Tab state hooks at the top level
  const [activeTab, setActiveTab] = useState("spike");
  const [showAllTabs, setShowAllTabs] = useState(false);

  // Carousel state for recommendations
  const [cardStartIndex, setCardStartIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const cards = filteredRecommendations.filter(
    (item) => item.patternType === activeTab
  );
  const visibleCards = cards.slice(
    cardStartIndex,
    cardStartIndex + cardsPerPage
  );

  // Responsive cardsPerPage
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        // sm
        setCardsPerPage(1);
      } else if (window.innerWidth < 1024) {
        // md
        setCardsPerPage(2);
      } else {
        setCardsPerPage(3);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Extract shared info for the current pattern (if any cards exist)
  const sharedPattern = cards[0]?.patternType;
  const sharedSuggestedAction = cards[0]?.suggestedAction;
  const sharedIssueDetected = cards[0]?.issueDetected;

  // Helper function to find recommendation for a specific barangay
  const findRecommendationForBarangay = (barangayName) => {
    if (!transformedBarangays) return null;
    // Normalize names for robust matching
    const normalizedTargetName = barangayName
      .toLowerCase()
      .replace(/barangay /g, "")
      .trim();
    return transformedBarangays.find(
      (item) =>
        item.name
          ?.toLowerCase()
          .replace(/barangay /g, "")
          .trim() === normalizedTargetName
    );
  };

  const commonwealthData = findRecommendationForBarangay("Commonwealth");
  const fairviewData = findRecommendationForBarangay("Fairview");
  // const holySpiritData = findRecommendationForBarangay("Holy Spirit"); // Will be replaced by dynamic rendering

  // Tab logic
  const tabOrder = ["spike", "gradual_rise", "stability", "decline", "none"];
  const patternMeta = {
    spike: { label: "Spike", color: "text-error", border: "border-error" },
    gradual_rise: {
      label: "Gradual Rise",
      color: "text-warning",
      border: "border-warning",
    },
    stability: {
      label: "Stability",
      color: "text-info",
      border: "border-info",
    },
    decline: {
      label: "Decline",
      color: "text-success",
      border: "border-success",
    },
    none: {
      label: "No Pattern",
      color: "text-gray-500",
      border: "border-gray-300",
    },
  };
  // Only include patterns that exist in the recommendations
  const availablePatterns = tabOrder.filter((p) =>
    filteredRecommendations.some((item) => item.patternType === p)
  );
  const tabOptions = availablePatterns.map((p) => ({
    value: p,
    label:
      patternMeta[p]?.label ||
      p.charAt(0).toUpperCase() + p.slice(1).replace("_", " "),
    color: patternMeta[p]?.color || "text-gray-500",
    border: patternMeta[p]?.border || "border-gray-300",
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
    spike: "Immediate Action Required",
    gradual_rise: "Action Required Soon",
    stability: "Monitor Situation",
    decline: "Continue Monitoring",
    none: "No Specific Pattern",
  };

  if (isLoadingInterventions || isLoadingPosts || isLoadingBarangays) {
    return <div>Loading...</div>;
  }

  if (errorInterventions || errorPosts || errorBarangays) {
    return (
      <div>
        Error loading data:{" "}
        {errorInterventions?.message ||
          errorPosts?.message ||
          errorBarangays?.message}
      </div>
    );
  }

  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center text-5xl font-extrabold mb-12 text-center md:justify-start md:text-left md:w-[48%]">
        Interventions
      </p>

      {/* END DASHBOARD SECTION */}
      <section className="flex flex-col gap-16">
        <div className="flex flex-col w-full gap-6">
          <p className="text-base-content text-4xl font-bold mb-2">
            Prescriptive Action Recommendations
          </p>
          <div className="flex gap-4 mb-2 flex-wrap items-center">
            {initialTabs.map((tab) => (
              <button
                key={tab.value}
                className={`px-6 py-2 rounded-full font-semibold border-2 transition-colors duration-200 ${
                  activeTab === tab.value
                    ? `${tab.color} ${tab.border} bg-white`
                    : "text-gray-500 border-transparent bg-gray-100 hover:bg-white"
                }`}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </button>
            ))}
            <div className="flex items-center">
              <div
                className={`flex flex-row items-center overflow-hidden transition-all duration-300 ease-in-out ${
                  showAllTabs ? "max-w-2xl ml-2" : "max-w-0"
                }`}
                style={{ gap: "1rem" }}
              >
                {extraTabs.map((tab) => (
                  <button
                    key={tab.value}
                    className={`px-6 py-2 rounded-full font-semibold border-2 transition-colors duration-200 ${
                      activeTab === tab.value
                        ? `${tab.color} ${tab.border} bg-white`
                        : "text-gray-500 border-transparent bg-gray-100 hover:bg-white"
                    }`}
                    onClick={() => setActiveTab(tab.value)}
                    style={{ transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)" }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {extraTabs.length > 0 && (
                <button
                  className="px-2 py-2 rounded-full border-2 border-gray-300 bg-gray-100 hover:bg-white flex items-center justify-center ml-2 transition-all duration-300 ease-in-out"
                  onClick={() => setShowAllTabs((v) => !v)}
                  title={
                    showAllTabs ? "Hide extra patterns" : "Show more patterns"
                  }
                >
                  {showAllTabs ? (
                    <IconChevronLeft size={20} />
                  ) : (
                    <IconChevronRight size={20} />
                  )}
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
                    ${sharedPattern === "spike" ? "border-error" : ""}
                    ${sharedPattern === "gradual_rise" ? "border-warning" : ""}
                    ${sharedPattern === "stability" ? "border-info" : ""}
                    ${sharedPattern === "decline" ? "border-success" : ""}
                    ${sharedPattern === "none" ? "border-gray-300" : ""}
                  `}
                  style={{ maxWidth: 600 }}
                >
                  {/* Action Required label with bg color */}
                  <p
                    className={`text-lg font-bold mb-3 px-4 py-1 rounded-xl inline-block
                    ${sharedPattern === "spike" ? "bg-error text-white" : ""}
                    ${
                      sharedPattern === "gradual_rise"
                        ? "bg-warning text-white"
                        : ""
                    }
                    ${sharedPattern === "stability" ? "bg-info text-white" : ""}
                    ${
                      sharedPattern === "decline" ? "bg-success text-white" : ""
                    }
                    ${
                      sharedPattern === "none"
                        ? "bg-gray-300 text-gray-700"
                        : ""
                    }
                  `}
                  >
                    {/* Use urgency text from pattern styles */}
                    {(() => {
                      const patternUrgency = {
                        spike: "Immediate Action Required",
                        gradual_rise: "Action Required Soon",
                        stability: "Monitor Situation",
                        decline: "Continue Monitoring",
                        none: "No Specific Pattern",
                      };
                      return patternUrgency[sharedPattern] || "Action Required";
                    })()}
                  </p>
                  {sharedPattern && (
                    <p className="text-base font-semibold mb-1 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center">
                        <Circle
                          weight="fill"
                          size={16}
                          className={
                            sharedPattern === "spike"
                              ? "text-error"
                              : sharedPattern === "gradual_rise"
                              ? "text-warning"
                              : sharedPattern === "stability"
                              ? "text-info"
                              : sharedPattern === "decline"
                              ? "text-success"
                              : "text-gray-400"
                          }
                        />
                      </span>
                      <span>Pattern:</span>{" "}
                      <span className="capitalize">
                        {sharedPattern.replace("_", " ")}
                      </span>
                    </p>
                  )}
                </div>
                <div className="overflow-y-auto max-h-[500px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleCards.map((item) => (
                      <div
                        key={item.name + item.patternType}
                        className="flex flex-col items-center"
                      >
                        <ActionRecommendationCard
                          barangay={item.name}
                          pattern_based={{
                            status: item.patternType,
                            alert: item.issueDetected,
                            admin_recommendation: item.suggestedAction,
                          }}
                          death_priority={item.death_priority}
                          hideSharedInfo={true}
                          hasValidIntervention={item.hasValidIntervention}
                          onApply={(barangay, patternType) => {
                            setSelectedBarangay(barangay);
                            setSelectedPattern(patternType);
                            setSelectedUrgency(
                              patternUrgencyMap[patternType] ||
                                "Action Required"
                            );
                            setShowAddModal(true);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    className="btn btn-sm"
                    onClick={() =>
                      setCardStartIndex((i) => Math.max(0, i - cardsPerPage))
                    }
                    disabled={cardStartIndex === 0}
                  >
                    Back
                  </button>
                  <button
                    className="btn btn-sm"
                    onClick={() =>
                      setCardStartIndex((i) =>
                        Math.min(cards.length - cardsPerPage, i + cardsPerPage)
                      )
                    }
                    disabled={cardStartIndex + cardsPerPage >= cards.length}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="text-gray-500 p-4 text-center">
                No{" "}
                {tabOptions
                  .find((t) => t.value === activeTab)
                  ?.label?.toLowerCase() || activeTab}{" "}
                recommendations available.
              </p>
            )}
          </div>
        </div>

        {/* Recent Intervention Records */}
        <div className="flex justify-between items-center mb-[-35px]">
          <p className="text-base-content text-4xl font-bold ">
            Recent Intervention Records
          </p>
          <Link
            to="/admin/interventions/all"
            className="bg-primary text-center text-nowrap font-semibold text-white py-1 px-3 rounded-full text-sm hover:bg-primary/80 transition-all duration-200"
          >
            View All Records
          </Link>
        </div>
        <div className="h-135">
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
          transformedBarangays={transformedBarangays}
        />
      )}
    </main>
  );
};

export default Interventions;
