import { Link } from "react-router-dom"; // Import Link for navigation
import {
  InterventionsTable,
  // FormCoordinationRequest, // Commented out as it's not used in the current visible layout
  ActionRecommendationCard,
  TableSkeleton,
} from "../../components";
import {
  useGetAllInterventionsQuery,
  useGetPostsQuery,
  useGetAdminBarangaysQuery,
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
import React, { useState, useEffect, useMemo, useRef } from "react";
import AddInterventionModal from "../../components/Admin/AddInterventionModal";
import {
  PATTERN_TYPES,
  PATTERN_LABELS,
  getPatternColor,
  getPatternLabel,
  normalizePatternType,
} from "../../utils/patternConfig";

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
    refetch: refetchInterventions,
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
  } = useGetAdminBarangaysQuery();

  // Load all QC barangay names from GeoJSON so we can add missing ones as 'No Pattern'
  const [allBarangayNames, setAllBarangayNames] = useState([]);
  useEffect(() => {
    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then((geo) => {
        const names = Array.isArray(geo?.features)
          ? geo.features
              .map((f) => f?.properties?.name)
              .filter((n) => typeof n === "string" && n.trim() !== "")
          : [];
        setAllBarangayNames(names);
      })
      .catch(() => setAllBarangayNames([]));
  }, []);

  // Log the raw API response data and transform it, augmenting with missing barangays as 'none'
  const transformedBarangays = React.useMemo(() => {
    const datasetBarangays = Array.isArray(barangaysList) ? barangaysList : [];

    console.log(
      "[DEBUG] Raw Barangays List:",
      JSON.stringify(datasetBarangays, null, 2)
    );

    const mapped = datasetBarangays.map((b) => {
      const patternBased = b.status_and_recommendation?.pattern_based || {};
      const reportBased = b.status_and_recommendation?.report_based || {};
      const deathBased = b.status_and_recommendation?.death_priority || {};

      return {
        name: b.name,
        _id: b._id,
        patternType: normalizePatternType(patternBased.status) || "none",
        issueDetected: patternBased.alert || "",
        suggestedAction:
          patternBased.admin_recommendation ||
          patternBased.recommendation ||
          "",
        ongoing_interventions: b.ongoing_interventions || 0,
        scheduled_interventions: b.scheduled_interventions || 0,
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

    // Add barangays not present in dataset as 'No Pattern'
    const datasetNameSet = new Set(
      mapped.map((m) => (m.name || "").toLowerCase())
    );
    const extras = (allBarangayNames || [])
      .filter((n) => n && !datasetNameSet.has(n.toLowerCase()))
      .map((name) => ({
        name,
        _id: `missing-${name}`,
        patternType: "none",
        issueDetected: "",
        suggestedAction: "",
        ongoing_interventions: 0,
        scheduled_interventions: 0,
        report_based: { count: 0, alert: "", recommendation: "" },
        death_priority: { count: 0, alert: "", recommendation: "" },
        _isMissingInDataset: true,
      }));

    return [...mapped, ...extras];
  }, [barangaysList, allBarangayNames]);

  // Log the transformed data
  useEffect(() => {
    if (transformedBarangays.length > 0) {
      console.log(
        "[DEBUG] Transformed Barangays List:",
        JSON.stringify(transformedBarangays, null, 2)
      );

      // Log pattern distribution
      const patternCounts = transformedBarangays.reduce((acc, item) => {
        acc[item.patternType] = (acc[item.patternType] || 0) + 1;
        return acc;
      }, {});
      console.log("[DEBUG] Pattern Distribution:", patternCounts);

      // Log spike patterns specifically
      const spikeBarangays = transformedBarangays.filter(
        (item) => normalizePatternType(item.patternType) === "spike"
      );
      console.log("[DEBUG] Spike Barangays:", spikeBarangays);
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
      transformedBarangays.map((b) => b.patternType).filter(Boolean)
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
        // Always include items explicitly missing from dataset under 'none'
        const isNone = normalizePatternType(item.patternType) === "none";
        const hasSignals =
          (item.issueDetected && item.issueDetected.toLowerCase() !== "none") ||
          (item.suggestedAction && item.suggestedAction.trim() !== "") ||
          item.death_priority.count > 0 ||
          (item.death_priority.alert &&
            item.death_priority.alert.trim() !== "") ||
          (item.death_priority.recommendation &&
            item.death_priority.recommendation.trim() !== "");
        return hasSignals || isNone;
      })
      // Sort by death count first (descending), then by pattern type
      .sort((a, b) => {
        // First sort by death count
        if (a.death_priority.count !== b.death_priority.count) {
          return b.death_priority.count - a.death_priority.count;
        }
        // If death counts are equal, sort by pattern type (spike first, then increase, etc.)
        const patternOrder = {
          spike: 0,
          increase: 1,
          decrease: 2,
          low_level_activity: 3,
          no_change: 4,
          none: 4,
        };
        return patternOrder[a.patternType] - patternOrder[b.patternType];
      });

    // Apply pattern filter
    if (patternFilter) {
      recommendations = recommendations.filter(
        (item) =>
          normalizePatternType(item.patternType) ===
          normalizePatternType(patternFilter)
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

  // ARIA support for AG Grid in InterventionsTable (must be before any early returns)
  const tableWrapperRef = useRef(null);
  useEffect(() => {
    try {
      const root = tableWrapperRef.current?.querySelector(".ag-root");
      if (!root) return;
      root.setAttribute("role", "grid");
      const headerViewport = root.querySelector(".ag-header-viewport");
      if (headerViewport) {
        headerViewport.setAttribute("role", "rowgroup");
        const headerRow = root.querySelector(".ag-header-row");
        if (headerRow) headerRow.setAttribute("role", "row");
        headerViewport
          .querySelectorAll(".ag-header-cell")
          .forEach((cell) => cell.setAttribute("role", "columnheader"));
      }
      root
        .querySelectorAll(".ag-center-cols-container .ag-row")
        .forEach((row) => row.setAttribute("role", "row"));
      root
        .querySelectorAll(".ag-center-cols-container .ag-cell")
        .forEach((cell) => cell.setAttribute("role", "gridcell"));
      const rowCount =
        root.querySelectorAll(".ag-center-cols-container .ag-row").length || 0;
      const colCount =
        root.querySelectorAll(".ag-header .ag-header-cell").length || 0;
      root.setAttribute("aria-rowcount", String(rowCount));
      root.setAttribute("aria-colcount", String(colCount));
    } catch {}
  }, [interventions]);

  // Log what is being rendered in ActionRecommendationCard for debugging
  console.log("ActionRecommendationCard data:", filteredRecommendations);

  // Tab state hooks at the top level - use centralized pattern types
  const [activeTab, setActiveTab] = useState(PATTERN_TYPES.SPIKE);
  const [showAllTabs, setShowAllTabs] = useState(false);

  // Carousel state for recommendations
  const [cardStartIndex, setCardStartIndex] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(3);
  const cards = filteredRecommendations.filter(
    (item) => normalizePatternType(item.patternType) === activeTab
  );

  // Debug logging for cards filtering
  console.log("[DEBUG] Cards Filtering:", {
    activeTab,
    filteredRecommendationsCount: filteredRecommendations.length,
    cardsCount: cards.length,
    activeTabPatterns: filteredRecommendations
      .filter((item) => normalizePatternType(item.patternType) === activeTab)
      .map((item) => ({
        name: item.name,
        patternType: item.patternType,
        normalized: normalizePatternType(item.patternType),
      })),
  });
  const visibleCards = cards.slice(
    cardStartIndex,
    cardStartIndex + cardsPerPage
  );

  // Count barangays per pattern for tab badges
  const patternCountsByTab = React.useMemo(() => {
    const counts = {};
    (filteredRecommendations || []).forEach((item) => {
      const key = normalizePatternType(item.patternType);
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [filteredRecommendations]);

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

  // Tab logic - use centralized pattern configuration
  const tabOrder = [
    PATTERN_TYPES.SPIKE,
    PATTERN_TYPES.INCREASE,
    PATTERN_TYPES.DECREASE,
    PATTERN_TYPES.LOW_LEVEL_ACTIVITY,
    PATTERN_TYPES.NO_CHANGE,
    "none",
  ];
  const patternMeta = {
    [PATTERN_TYPES.SPIKE]: {
      label: PATTERN_LABELS[PATTERN_TYPES.SPIKE],
      color: "text-error",
      border: "border-error",
    },
    [PATTERN_TYPES.INCREASE]: {
      label: PATTERN_LABELS[PATTERN_TYPES.INCREASE],
      color: "text-warning",
      border: "border-warning",
    },
    [PATTERN_TYPES.DECREASE]: {
      label: PATTERN_LABELS[PATTERN_TYPES.DECREASE],
      color: "text-success",
      border: "border-success",
    },
    [PATTERN_TYPES.LOW_LEVEL_ACTIVITY]: {
      label: PATTERN_LABELS[PATTERN_TYPES.LOW_LEVEL_ACTIVITY],
      color: "text-info",
      border: "border-info",
    },
    [PATTERN_TYPES.NO_CHANGE]: {
      label: PATTERN_LABELS[PATTERN_TYPES.NO_CHANGE],
      color: "text-gray-500",
      border: "border-gray-300",
    },
    none: {
      label: "No Pattern",
      color: "text-gray-500",
      border: "border-gray-300",
    },
  };
  // Show ALL standardized pattern types, even if they don't have data yet
  const availablePatterns = tabOrder; // Show all patterns
  const tabOptions = availablePatterns.map((p) => ({
    value: p,
    label: patternMeta[p]?.label || "Unknown Pattern",
    color: patternMeta[p]?.color || "text-gray-500",
    border: patternMeta[p]?.border || "border-gray-300",
    count: patternCountsByTab[p] || 0,
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
    [PATTERN_TYPES.SPIKE]: "Immediate Action Required",
    [PATTERN_TYPES.INCREASE]: "Action Required Soon",
    [PATTERN_TYPES.DECREASE]: "Continue Monitoring",
    [PATTERN_TYPES.LOW_LEVEL_ACTIVITY]: "Monitor Situation",
    [PATTERN_TYPES.NO_CHANGE]: "No Specific Pattern",
    none: "No Specific Pattern",
  };

  if (isLoadingInterventions || isLoadingPosts || isLoadingBarangays) {
    return (
      <main className="flex flex-col w-full">
        <p className="flex justify-center text-5xl font-extrabold mb-12 text-center md:justify-start md:text-left md:w-[48%]">
          Interventions
        </p>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col text-center rounded-2xl shadow bg-base-100 border border-base-200 px-6 py-5 items-center"
            >
              <div className="skeleton h-7 w-7 mb-1" />
              <div className="skeleton h-8 w-12 mb-2" />
              <div className="skeleton h-4 w-20" />
            </div>
          ))}
        </div>

        <section className="flex flex-col gap-16">
          <div className="flex flex-col w-full gap-6">
            <p className="text-base-content text-4xl font-bold mb-2">
              Prescriptive Action Recommendations
            </p>

            {/* Pattern Tabs Skeleton */}
            <div className="flex gap-4 flex-wrap items-center mb-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton h-10 w-32 rounded-full" />
              ))}
            </div>

            {/* Cards Container Skeleton */}
            <div className="rounded-xl shadow p-4">
              <div className="skeleton h-20 w-full mb-4 rounded-2xl" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="skeleton h-64 rounded-xl" />
                ))}
              </div>
            </div>
          </div>

          {/* Recent Interventions Skeleton */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-base-content text-4xl font-bold">
              Recent Intervention Records
            </p>
            <div className="skeleton h-8 w-32 rounded-full" />
          </div>
          <div className="h-135">
            <TableSkeleton rows={5} columns={6} />
          </div>
        </section>
      </main>
    );
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
          <div className="flex gap-4 flex-wrap items-center">
            {initialTabs.map((tab) => (
              <button
                key={tab.value}
                className={`px-6 py-2 rounded-full font-semibold border-2 transition-colors duration-200 shadow-sm hover:cursor-pointer ${
                  activeTab === tab.value
                    ? `${tab.color} ${tab.border} bg-white`
                    : "text-gray-500 border-transparent bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => setActiveTab(tab.value)}
              >
                <span className="flex items-center gap-2">
                  <span className="whitespace-nowrap">{tab.label}</span>
                  <span className="inline-flex items-center justify-center text-xs font-bold text-white bg-gray-500 rounded-full min-w-5 h-5 px-2">
                    {tab.count}
                  </span>
                </span>
              </button>
            ))}
            {extraTabs.length > 0 && (
              <div className="relative">
                <button
                  className="px-4 py-2 rounded-full font-semibold border-2 border-gray-300 bg-gray-100 text-gray-700 hover:bg-white hover:cursor-pointer shadow-sm"
                  onClick={() => setShowAllTabs((v) => !v)}
                >
                  More
                </button>
                {showAllTabs && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                    <div className="py-2 max-h-80 overflow-auto">
                      {extraTabs.map((tab) => (
                        <button
                          key={tab.value}
                          className={`w-full text-left px-4 py-2 flex items-center justify-between hover:bg-gray-50 ${
                            activeTab === tab.value ? "bg-gray-50" : ""
                          }`}
                          onClick={() => {
                            setActiveTab(tab.value);
                            setShowAllTabs(false);
                          }}
                        >
                          <span className="whitespace-nowrap">{tab.label}</span>
                          <span className="inline-flex items-center justify-center text-xs font-bold text-white bg-gray-500 rounded-full min-w-5 h-5 px-2">
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className=" rounded-xl shadow p-4">
            {cards.length > 0 ? (
              <>
                {/* Centered, colored shared info box for the current pattern */}
                <div
                  className={` flex flex-col items-center justify-center text-center rounded-2xl  px-6 py-4 w-full mx-auto
                    ${getPatternColor(sharedPattern, "border")}
                  `}
                  style={{ maxWidth: 600 }}
                >
                  {/* Action Required label with bg color */}
                  <p
                    className={`text-lg font-bold mb-3 px-4 py-1 rounded-xl inline-block ${getPatternColor(
                      sharedPattern,
                      "badge"
                    )} text-white`}
                  >
                    {/* Use urgency text from pattern styles */}
                    {patternUrgencyMap[sharedPattern] || "Action Required"}
                  </p>
                  {sharedPattern && (
                    <p className="text-base font-semibold mb-1 flex items-center justify-center gap-2">
                      <span className="inline-flex items-center">
                        <Circle
                          weight="fill"
                          size={16}
                          className={getPatternColor(sharedPattern, "text")}
                        />
                      </span>
                      <span>Pattern:</span>{" "}
                      <span className="capitalize">
                        {getPatternLabel(sharedPattern)}
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
                          barangayId={item._id}
                          pattern_based={{
                            status: item.patternType,
                            alert: item.issueDetected,
                            admin_recommendation: item.suggestedAction,
                          }}
                          death_priority={item.death_priority}
                          hideSharedInfo={true}
                          ongoing_interventions={item.ongoing_interventions}
                          scheduled_interventions={item.scheduled_interventions}
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
              <>
                {/* Show pattern info even when no cards exist */}
                <div
                  className={`flex flex-col items-center justify-center text-center rounded-2xl px-6 py-4 w-full mx-auto ${getPatternColor(
                    activeTab,
                    "border"
                  )}`}
                  style={{ maxWidth: 600 }}
                >
                  <p
                    className={`text-lg font-bold mb-3 px-4 py-1 rounded-xl inline-block ${getPatternColor(
                      activeTab,
                      "badge"
                    )} text-white`}
                  >
                    {patternUrgencyMap[activeTab] || "Action Required"}
                  </p>
                  <p className="text-base font-semibold mb-1 flex items-center justify-center gap-2">
                    <span className="inline-flex items-center">
                      <Circle
                        weight="fill"
                        size={16}
                        className={getPatternColor(activeTab, "text")}
                      />
                    </span>
                    <span>Pattern:</span>{" "}
                    <span className="capitalize">
                      {getPatternLabel(activeTab)}
                    </span>
                  </p>
                </div>
                <p className="text-gray-500 p-4 text-center mt-4">
                  No{" "}
                  {tabOptions
                    .find((t) => t.value === activeTab)
                    ?.label?.toLowerCase() || activeTab}{" "}
                  recommendations available.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Recent Intervention Records */}
        <div className="flex justify-between items-center mb-[-35px]">
          <p className="text-base-content text-4xl font-bold ">
            Recent Intervention Records
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/interventions/archives"
              className="border border-gray-300 bg-white text-gray-700 text-center text-nowrap font-semibold py-1 px-3 rounded-full text-sm hover:bg-gray-50 transition-all duration-200"
            >
              View Archives
            </Link>
            <Link
              to="/admin/interventions/all"
              className="bg-primary text-center text-nowrap font-semibold text-white py-1 px-3 rounded-full text-sm hover:bg-primary/80 transition-all duration-200"
            >
              View All Records
            </Link>
          </div>
        </div>
        <div className="h-135" ref={tableWrapperRef}>
          <InterventionsTable
            interventions={interventions}
            onlyRecent={true}
            refetchInterventions={refetchInterventions}
          />
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
