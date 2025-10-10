import {
  MapPinLine,
  Circle,
  CheckCircle,
  Hourglass,
  MagnifyingGlass,
  Upload,
  Clock,
  Megaphone,
  CaretDown,
} from "phosphor-react";
import { useState, useMemo, useRef, useEffect } from "react";
import {
  useGetInterventionsInProgressQuery,
  useGetAllInterventionsQuery,
  useGetAdminBarangaysQuery,
  useGetRecentReportsForBarangayMutation,
  useGetClusterSummariesQuery,
  useGetSpecificClusterQuery,
  useResolveReportsMutation,
  useAddReportsToSubClusterMutation,
  useRemoveReportsFromSubClusterMutation,
  useGetGroupedReportsQuery,
  useValidatePostMutation,
  useLazyGetReportsByBarangayQuery,
  useLazyGetPostByIdQuery,
} from "@/api/dengueApi";
import ClusterDetailsSkeleton from "@/components/Skeletons/ClusterDetailsSkeleton";
import center from "@turf/center";
import {
  ClusterDropdown,
  BarangaySearch,
  MapContainer,
  BarangayDetails,
  ClusterDetailsModal,
  MainReportModal,
} from "../../components/Admin";
import stagnantIcon from "../../assets/icons/stagnant_water.svg";
import garbageIcon from "../../assets/icons/garbage.svg";
import othersIcon from "../../assets/icons/others.svg";
import foggingIcon from "../../assets/icons/fogging.svg";
import trappingIcon from "../../assets/icons/trapping.svg";
import cleanUpIcon from "../../assets/icons/cleanup.svg";
import educationIcon from "../../assets/icons/education.svg";
import allIcon from "../../assets/all.svg";
import {
  IconExclamationCircle,
  IconExclamationMark,
} from "@tabler/icons-react";
import { InfoIcon } from "lucide-react";
import { toast } from "react-toastify";

// Define QC_CENTER constant for default map position
const QC_CENTER = {
  lat: 14.676, // Quezon City's approximate center latitude
  lng: 121.0437, // Quezon City's approximate center longitude
};

// Lightweight normalization helpers for tolerant barangay name matching (search-only)
const normalizeName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/\bbarangay\s+/g, "")
    .replace(/\bsr\.?$/g, "")
    .replace(/[.'\-]/g, "")
    .replace(/\s+/g, "")
    .trim();
};
const namesAreEquivalent = (a, b) => normalizeName(a) === normalizeName(b);

// Add breeding site type icon mapping
const BREEDING_SITE_TYPE_ICONS = {
  "Stagnant Water": stagnantIcon,
  "Standing Water": stagnantIcon, // Use same icon as stagnant water
  "Uncollected Garbage or Trash": garbageIcon,
  Others: othersIcon,
  default: stagnantIcon,
};

const DengueMapping = () => {
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMapItem, setSelectedMapItem] = useState(null);
  const [showFullReport, setShowFullReport] = useState(false);
  const [selectedFullReport, setSelectedFullReport] = useState(null);
  const [isFetchingFullReport, setIsFetchingFullReport] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [importError, setImportError] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [showBreedingSites, setShowBreedingSites] = useState(true);
  const [showInterventions, setShowInterventions] = useState(false);
  const [showClusterDropdown, setShowClusterDropdown] = useState(false);
  const [showClusterDetailsModal, setShowClusterDetailsModal] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedReports, setSelectedReports] = useState([]);
  const [rejectedReports, setRejectedReports] = useState([]);
  const [pendingRejections, setPendingRejections] = useState([]);
  const [pendingIndividualValidations, setPendingIndividualValidations] =
    useState([]);
  const [resolvedReports, setResolvedReports] = useState([]);
  const [subClusters, setSubClusters] = useState([]);
  const [clusterResolution, setClusterResolution] = useState("pending"); // pending, resolved, rejected
  const [bulkConfirm, setBulkConfirm] = useState({
    open: false,
    action: null,
    ids: [],
    reports: [],
    loading: false,
  });
  const mapOnlyRef = useRef(null);
  const mapRef = useRef(null);
  const modalRef = useRef(null);
  const streetViewModalRef = useRef(null);
  const mapContainerRef = useRef(null);
  const importModalRef = useRef(null);
  // Fetch minimal reports list within the selected barangay on demand (optimized GET)
  const [
    triggerGetReportsByBarangay,
    { data: reportsByBarangay, isFetching: isFetchingBarangayPosts },
  ] = useLazyGetReportsByBarangayQuery();
  const { data: allInterventionsData, isLoading: isLoadingAllInterventions } =
    useGetAllInterventionsQuery();
  const { data: barangaysList, isLoading: isLoadingBarangays } =
    useGetAdminBarangaysQuery();

  // Add filtered barangays state
  const [filteredBarangays, setFilteredBarangays] = useState([]);

  const [getRecentReports] = useGetRecentReportsForBarangayMutation();
  const [triggerGetReportById] = useLazyGetPostByIdQuery();

  // Cluster mutation hooks
  const [resolveReports] = useResolveReportsMutation();
  const [addReportsToSubCluster] = useAddReportsToSubClusterMutation();
  const [removeReportsFromSubCluster] =
    useRemoveReportsFromSubClusterMutation();
  const [validatePost] = useValidatePostMutation();

  const [recentDengueCases, setRecentDengueCases] = useState(null);
  // Debug: confirm we're in Admin DengueMapping and using admin baseUrl
  useEffect(() => {
    try {
      console.debug("[Admin/DengueMapping] Mounted", {
        locationPath:
          typeof window !== "undefined"
            ? window.location.pathname
            : "(no-window)",
      });
    } catch (_) {}
  }, []);

  // Get lightweight cluster summaries from API
  const {
    data: clusterSummaries,
    isLoading: isLoadingClusters,
    refetch: refetchClusters,
  } = useGetClusterSummariesQuery();

  // New: fetch grouped reports (individual + clusters)
  const { data: groupedReportsData, refetch: refetchGroupedReports } =
    useGetGroupedReportsQuery();

  // Get specific cluster details when selected
  const {
    data: specificClusterData,
    isLoading: isLoadingSpecificCluster,
    refetch: refetchSpecificCluster,
  } = useGetSpecificClusterQuery(selectedCluster?._id || selectedCluster?.id, {
    skip: !selectedCluster,
  });

  // Transform summaries to match our component structure for dropdown
  const transformedClusters = useMemo(() => {
    const list = Array.isArray(clusterSummaries)
      ? clusterSummaries
      : Array.isArray(clusterSummaries?.data)
      ? clusterSummaries.data
      : [];
    if (list.length === 0) {
      return [];
    }

    const transformed = list.map((cluster) => ({
      id: cluster.id || cluster._id || cluster.clusterId,
      name: `Cluster in ${cluster.barangay}`,
      center: cluster.center || { lng: 121.0437, lat: 14.676 },
      count: cluster.count,
      severity: cluster.severity || "low",
      earliestReportAt: cluster?.date_range?.start_date,
      latestReportAt: cluster?.date_range?.end_date,
      barangays: [cluster.barangay],
      // summaries do not include full reports; keep these lightweight
      reports: [],
      resolvedCount: cluster.resolvedCount ?? 0,
      unprocessedCount: Math.max(
        0,
        (cluster.count || 0) - (cluster.resolvedCount || 0)
      ),
      isResolved: cluster.isResolved,
      processedCount: cluster.resolvedCount ?? 0,
      subClusters: [],
      metadata: {},
    }));

    return transformed;
  }, [clusterSummaries]);

  const getClusterStatus = (cluster) => {
    if (typeof cluster.isResolved === "string") {
      if (cluster.isResolved === "fully_resolved") return "fully-resolved";
      if (cluster.isResolved === "partially_resolved")
        return "partially-resolved";
      return "pending"; // not_resolved
    }
    if (typeof cluster.isResolved === "boolean") {
      return cluster.isResolved ? "fully-resolved" : "pending";
    }
    // Prefer explicit metadata if present
    if (cluster.metadata && cluster.metadata.status) {
      switch (cluster.metadata.status) {
        case "resolved":
          return "fully-resolved";
        case "pending":
          return "pending";
      }
    }

    const totalReports = cluster.reports ? cluster.reports.length : 0;
    const resolvedCount = cluster.resolvedCount ?? 0;
    const unprocessedCount =
      typeof cluster.unprocessedCount === "number"
        ? cluster.unprocessedCount
        : Math.max(0, totalReports - resolvedCount);

    if (totalReports === 0) return "pending";
    if (resolvedCount === totalReports) return "fully-resolved";
    if (resolvedCount > 0) return "partially-resolved";
    return "pending";
  };

  const getClusterStatusColor = (status) => {
    switch (status) {
      case "fully-resolved":
        return "#10b981"; // emerald-500 - green
      case "partially-resolved":
        return "#f59e0b"; // amber-500 - orange/yellow
      case "pending":
        return "#dc2626"; // red-600 - red
      case "partial":
        return "#6b7280"; // gray-500 - gray
      default:
        return "#6b7280";
    }
  };

  const flaggedClusters = useMemo(() => {
    // Show all clusters that have at least 2 reports or are high severity
    const flagged = transformedClusters.filter((c) => {
      const status = getClusterStatus(c);
      return (c.count >= 2 || c.severity === "high") && status !== "partial";
    });
    return flagged;
  }, [transformedClusters]);

  // Separate clusters by status for better organization
  const pendingClusters = useMemo(() => {
    return flaggedClusters.filter((c) => {
      if (typeof c.isResolved === "string") {
        return c.isResolved === "not_resolved";
      }
      if (typeof c.isResolved === "boolean") {
        return c.isResolved === false;
      }
      return getClusterStatus(c) === "pending";
    });
  }, [flaggedClusters]);

  const partiallyResolvedClusters = useMemo(() => {
    return flaggedClusters.filter((c) => {
      if (typeof c.isResolved === "string") {
        return c.isResolved === "partially_resolved";
      }
      return getClusterStatus(c) === "partially-resolved";
    });
  }, [flaggedClusters]);

  const fullyResolvedClusters = useMemo(() => {
    return flaggedClusters.filter((c) => {
      if (typeof c.isResolved === "string") {
        return c.isResolved === "fully_resolved";
      }
      if (typeof c.isResolved === "boolean") {
        return c.isResolved === true;
      }
      return getClusterStatus(c) === "fully-resolved";
    });
  }, [flaggedClusters]);

  // Prefer new grouped endpoint for map rendering
  const rawClusters = useMemo(() => {
    if (groupedReportsData && Array.isArray(groupedReportsData.clusters)) {
      // Normalize: attach a stable id and center if missing
      return groupedReportsData.clusters.map((c) => {
        const reports = Array.isArray(c.reports) ? c.reports : [];
        const coords = reports
          .map((r) => r?.specific_location?.coordinates)
          .filter((p) => Array.isArray(p) && p.length === 2);
        const center = coords.length
          ? {
              lng: coords.reduce((s, p) => s + p[0], 0) / coords.length,
              lat: coords.reduce((s, p) => s + p[1], 0) / coords.length,
            }
          : { ...QC_CENTER };
        return {
          _id: c.parentClusterId || c._id || c.id,
          id: c.parentClusterId || c._id || c.id,
          barangay: c.barangay,
          reports,
          center,
          isResolved: !!c.isResolved,
          breakdown: {
            resolved_reports: c?.cluster_summary?.validated || 0,
          },
        };
      });
    }
    // Fallback to empty when no grouped data
    return [];
  }, [groupedReportsData]);

  const getSeverityColor = (severity) => {
    if (severity === "high") return "#dc2626"; // red-600
    if (severity === "medium") return "#f59e0b"; // amber-500
    return "#10b981"; // emerald-500
  };

  const formatDateRange = (earliestDate, latestDate) => {
    const earliest = new Date(earliestDate);
    const latest = new Date(latestDate);
    const now = new Date();

    // If same day, show just the date
    if (earliest.toDateString() === latest.toDateString()) {
      return earliest.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    // If within same month, show "Dec 15 - 20"
    if (
      earliest.getMonth() === latest.getMonth() &&
      earliest.getFullYear() === latest.getFullYear()
    ) {
      return `${earliest.toLocaleDateString("en-US", {
        month: "short",
      })} ${earliest.getDate()} - ${latest.getDate()}`;
    }

    // If different months but same year, show "Dec 15 - Jan 5"
    if (earliest.getFullYear() === latest.getFullYear()) {
      return `${earliest.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${latest.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    }

    // If different years, show full dates
    return `${earliest.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} - ${latest.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  const zoomToCluster = (cluster) => {
    if (mapOnlyRef.current) {
      mapOnlyRef.current.panTo(cluster.center);
      mapOnlyRef.current.setZoom(21);
      if (mapContainerRef.current) {
        mapContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
    setShowClusterDropdown(false);
  };

  const handleViewClusterDetails = (cluster) => {
    setSelectedCluster(cluster);
    setShowClusterDetailsModal(true);
    setShowClusterDropdown(false);

    // Reset selection states when opening a new cluster
    setSelectedReports([]);
    setRejectedReports([]);
    setPendingRejections([]);
    setPendingIndividualValidations([]);
    setResolvedReports([]);
  };

  // Get report IDs that belong to validated sub-clusters of the selected cluster
  const getValidatedReportIdsFromSelectedCluster = () => {
    const ids = new Set();
    const subClustersList = selectedCluster?.subClusters || [];
    subClustersList.forEach((sc) => {
      const type = sc.cluster_type || sc.clusterType || sc.type;
      if (type === "validated" && Array.isArray(sc.reports)) {
        sc.reports.forEach((rid) => ids.add(rid));
      }
    });
    return ids;
  };

  const getReportTypeColor = (type) => {
    if (type === "Dengue Case") return "#dc2626"; // red-600
    if (type === "Breeding Site") return "#f59e0b"; // amber-500
    return "#10b981"; // emerald-500
  };

  // Helpers for custom bulk confirmation modal
  const openBulkConfirm = (action) => {
    if (!selectedCluster) return;
    const validatedIds = getValidatedReportIdsFromSelectedCluster();
    const cluster =
      (specificClusterData && specificClusterData.data) || selectedCluster;
    const all = cluster?.reports || [];
    let eligibleIds = [];
    if (action === "resolve-all") {
      eligibleIds = all
        .filter((r) => {
          const rid = r?._id || r?.id;
          return (
            rid &&
            r.exclude_from_clustering !== true &&
            !validatedIds.has(rid) &&
            !resolvedReports.includes(rid) &&
            !rejectedReports.includes(rid)
          );
        })
        .map((r) => r._id || r.id);
    } else if (action === "reject-all") {
      eligibleIds = all
        .filter((r) => {
          const rid = r?._id || r?.id;
          return (
            rid && !validatedIds.has(rid) && !resolvedReports.includes(rid)
          );
        })
        .map((r) => r._id || r.id);
    }
    const eligibleReports = all.filter((r) => {
      const rid = r?._id || r?.id;
      return eligibleIds.includes(rid);
    });
    setBulkConfirm({
      open: true,
      action,
      ids: eligibleIds,
      reports: eligibleReports,
    });
  };

  const closeBulkConfirm = () =>
    setBulkConfirm({
      open: false,
      action: null,
      ids: [],
      reports: [],
      loading: false,
    });

  const confirmBulkAction = async () => {
    if (!bulkConfirm.open || !selectedCluster) return;
    const { action, ids } = bulkConfirm;

    // Set loading state
    setBulkConfirm((prev) => ({ ...prev, loading: true }));

    if (action === "resolve-all") {
      try {
        const clusterId = selectedCluster._id || selectedCluster.id;
        const result = await resolveReports({
          clusterId,
          reportIds: ids,
          isResolved: true,
        });
        if (result && !result.error) {
          toast.success(`Successfully resolved ${ids.length} reports.`);
          try {
            await Promise.all([
              refetchClusters?.(),
              refetchGroupedReports?.(),
              refetchSpecificCluster?.(),
            ]);
          } catch (_) {}
        } else {
          console.error("[Bulk Resolve] Failed:", result?.error || result);
          toast.error("Failed to resolve reports. Please try again.");
        }
      } catch (e) {
        console.error("[Bulk Resolve] Exception:", e);
        toast.error("Failed to resolve reports. Please try again.");
      } finally {
        // Clear local selections for those ids
        setSelectedReports((prev) => prev.filter((id) => !ids.includes(id)));
        setPendingRejections((prev) => prev.filter((id) => !ids.includes(id)));
      }
    } else if (action === "reject-all") {
      setPendingRejections((prev) => {
        const set = new Set(prev);
        ids.forEach((id) => set.add(id));
        return Array.from(set);
      });
      setSelectedReports((prev) => prev.filter((id) => !ids.includes(id)));
      toast.info(`Marked ${ids.length} reports for rejection.`);
    }
    closeBulkConfirm();
  };

  const getStatusColor = (status) => {
    if (status === "Confirmed") return "#dc2626"; // red-600
    if (status === "Under Investigation") return "#f59e0b"; // amber-500
    if (status === "Validated") return "#3b82f6"; // blue-500
    if (status === "Resolved") return "#10b981"; // emerald-500
    if (status === "Pending Verification") return "#f59e0b"; // amber-500
    return "#6b7280"; // gray-500
  };

  const handleReportSelection = (reportId, action) => {
    if (action === "select") {
      setSelectedReports((prev) => [...prev, reportId]);
      // Remove from rejected if it was rejected
      setRejectedReports((prev) => prev.filter((id) => id !== reportId));
    } else if (action === "deselect") {
      setSelectedReports((prev) => prev.filter((id) => id !== reportId));
    } else if (action === "unreject") {
      // Remove from rejected
      setRejectedReports((prev) => prev.filter((id) => id !== reportId));
    }
  };

  const handleIndividualValidation = async (reportId, action) => {
    try {
      if (action === "validate") {
        // Add to pending individual validations for confirmation
        setPendingIndividualValidations((prev) => [...prev, reportId]);
        return;
      } else if (action === "confirm-validate") {
        // Confirm individual validation
        const result = await validatePost({
          id: reportId,
          status: "Validated",
        });

        if (result.data) {
          toast.success("Report validated successfully");
          setPendingIndividualValidations((prev) =>
            prev.filter((id) => id !== reportId)
          );
          setSelectedReports((prev) => prev.filter((id) => id !== reportId));
          setRejectedReports((prev) => prev.filter((id) => id !== reportId));
        } else {
          console.error("Failed to validate report:", result.error);
          toast.error("Failed to validate report. Please try again.");
        }
      } else if (action === "cancel-validate") {
        // Cancel pending individual validation
        setPendingIndividualValidations((prev) =>
          prev.filter((id) => id !== reportId)
        );
      } else if (action === "reject") {
        // Add to pending rejections for confirmation
        setPendingRejections((prev) => [...prev, reportId]);
        return;
      } else if (action === "confirm-reject") {
        // Confirm rejection
        const result = await validatePost({ id: reportId, status: "Rejected" });

        if (result.data) {
          toast.success("Report rejected successfully");
          setPendingRejections((prev) => prev.filter((id) => id !== reportId));
          setSelectedReports((prev) => prev.filter((id) => id !== reportId));
        } else {
          console.error("Failed to reject report:", result.error);
          toast.error("Failed to reject report. Please try again.");
        }
      } else if (action === "cancel-reject") {
        // Cancel pending rejection
        setPendingRejections((prev) => prev.filter((id) => id !== reportId));
      } else if (action === "unvalidate") {
        // Unvalidate individual report
        const result = await validatePost({
          id: reportId,
          status: "Pending Verification",
        });

        if (result.data) {
          toast.success("Report status updated successfully");
        } else {
          console.error("Failed to update report status:", result.error);
          toast.error("Failed to update report status. Please try again.");
        }
      } else if (action === "unreject") {
        // Unreject individual report
        const result = await validatePost({
          id: reportId,
          status: "Pending Verification",
        });

        if (result.data) {
          toast.success("Report status updated successfully");
        } else {
          console.error("Failed to update report status:", result.error);
          toast.error("Failed to update report status. Please try again.");
        }
      } else {
        console.error("Invalid action for individual validation:", action);
        return;
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      toast.error("Error updating report status. Please try again.");
    }
  };

  const handleClusterResolution = async (action, reportIds = null) => {
    if (action === "resolve-selected") {
      try {
        // Resolve only selected reports, keep others pending
        const selectedReportIds = selectedReports;
        const remainingReports = selectedCluster.reports.filter(
          (report) =>
            !selectedReportIds.includes(report.id) &&
            !resolvedReports.includes(report.id)
        );

        // Check if selected reports can form a sub-cluster (need at least 2)
        const clusterId = selectedCluster._id || selectedCluster.id;
        const result = await resolveReports({
          clusterId,
          reportIds: selectedReportIds,
          isResolved: true,
        });

        if (result && !result.error) {
          setResolvedReports((prev) => [...prev, ...selectedReportIds]);
          setSelectedReports([]);
          toast.success(
            `Resolved ${selectedReportIds.length} reports. ${remainingReports.length} reports remain pending.`
          );
          try {
            await Promise.all([
              refetchClusters?.(),
              refetchGroupedReports?.(),
              refetchSpecificCluster?.(),
            ]);
          } catch (_) {}
        } else {
          console.error(
            `[ERROR] Failed to resolve reports:`,
            result?.error || result
          );
          const errorMessage =
            result?.error?.data?.error ||
            result?.error?.message ||
            "Unknown error occurred";
          toast.error(`Failed to resolve reports: ${errorMessage}`);
        }
      } catch (error) {
        console.error(`[ERROR] Error resolving cluster:`, error);
        toast.error("Error resolving cluster. Please try again.");
      }
    } else if (action === "resolve-all") {
      try {
        // Resolve all eligible reports (same logic as resolve-selected but with all eligible reports)
        const eligibleReportIds = reportIds || [];
        const remainingReports = selectedCluster.reports.filter(
          (report) =>
            !eligibleReportIds.includes(report.id) &&
            !resolvedReports.includes(report.id)
        );

        // Check if eligible reports can form a sub-cluster (need at least 2)
        const clusterId = selectedCluster._id || selectedCluster.id;
        const result = await resolveReports({
          clusterId,
          reportIds: eligibleReportIds,
          isResolved: true,
        });

        if (result && !result.error) {
          setResolvedReports((prev) => [...prev, ...eligibleReportIds]);
          setSelectedReports([]);
          toast.success(
            `Resolved ${eligibleReportIds.length} reports. ${remainingReports.length} reports remain pending.`
          );
          try {
            await Promise.all([
              refetchClusters?.(),
              refetchGroupedReports?.(),
              refetchSpecificCluster?.(),
            ]);
          } catch (_) {}
        } else {
          console.error(
            `[ERROR] Failed to resolve reports:`,
            result?.error || result
          );
          const errorMessage =
            result?.error?.data?.error ||
            result?.error?.message ||
            "Unknown error occurred";
          toast.error(`Failed to resolve reports: ${errorMessage}`);
        }
      } catch (error) {
        console.error(`[ERROR] Error resolving cluster:`, error);
        toast.error("Error resolving cluster. Please try again.");
      }
    } else if (action === "reject-all") {
      openBulkConfirm("reject-all");
    }
  };

  const getSelectedReportsCount = () => {
    return selectedReports.length;
  };

  const getUnselectedReportsCount = () => {
    return (
      selectedCluster?.reports.length -
      selectedReports.length -
      rejectedReports.length
    );
  };

  const getRejectedReportsCount = () => {
    return rejectedReports.length;
  };

  const getResolvedReportsCount = () => {
    return resolvedReports.length;
  };

  const hasResolvedReports = () => {
    return resolvedReports.length > 0;
  };

  const getRemainingReports = () => {
    return (
      selectedCluster?.reports.filter(
        (report) =>
          !resolvedReports.includes(report.id) &&
          !rejectedReports.includes(report.id)
      ) || []
    );
  };

  const canFormSubCluster = () => {
    const remaining = getRemainingReports();
    return remaining.length >= 2;
  };

  const { data: interventionsData } = useGetInterventionsInProgressQuery(
    selectedBarangay?.properties?.name || "",
    {
      skip: !selectedBarangay?.properties?.name,
    }
  );

  // Fetch reports within barangay when a barangay is selected
  useEffect(() => {
    const name = selectedBarangay?.properties?.name || selectedBarangay?.name;
    if (!name) return;
    triggerGetReportsByBarangay(name);
  }, [selectedBarangay, triggerGetReportsByBarangay]);

  // Map minimal response to UI shape
  const reportsWithinBarangay = useMemo(() => {
    const name = selectedBarangay?.properties?.name || selectedBarangay?.name;
    if (!name || !reportsByBarangay) return [];

    // Expected shape from GET /reports/by-barangay
    if (
      reportsByBarangay?.success &&
      Array.isArray(reportsByBarangay?.reports)
    ) {
      return reportsByBarangay.reports.map((r) => ({
        _id: r.id,
        id: r.id,
        date_and_time: r.date,
        description: r.description,
        report_type: r.report_type,
        barangay: reportsByBarangay.barangay || name,
        specific_location: { coordinates: r.coordinates },
        status: r.status || "",
        images: [],
      }));
    }
    return [];
  }, [reportsByBarangay, selectedBarangay]);

  // Memoized list of interventions to display on admin map
  const activeInterventions = useMemo(() => {
    if (!allInterventionsData) return [];

    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const filtered = allInterventionsData.filter((intervention) => {
      const status = (intervention.status || "").toLowerCase();
      if (status === "ongoing" || status === "scheduled") return true;
      if (status === "completed" || status === "complete") {
        const d = new Date(
          intervention.date ||
            intervention.date_and_time ||
            intervention.updatedAt ||
            intervention.createdAt ||
            0
        );
        return !isNaN(d.getTime()) && now - d.getTime() <= THIRTY_DAYS;
      }
      return false;
    });

    const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return sorted;
  }, [allInterventionsData]);

  // Add this effect to handle modal
  useEffect(() => {
    if (showFullReport && selectedFullReport) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [showFullReport, selectedFullReport]);

  useEffect(() => {
    async function fetchRecentReports() {
      if (!selectedBarangay?.name) {
        setRecentReports([]);
        return;
      }
      try {
        const barangayName = selectedBarangay.name.trim();
        const BASE_URL =
          import.meta.env.VITE_MODE === "PROD" ||
          import.meta.env.MODE === "PROD"
            ? import.meta.env.VITE_API_BASE_URL
            : "http://localhost:4000/";

        const response = await fetch(
          `${BASE_URL}api/v1/barangays/get-recent-reports-for-barangay`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ barangay_name: barangayName }),
          }
        );
        if (!response.ok) throw new Error("Failed to fetch recent reports");
        const data = await response.json();
        const caseCounts = data?.reports?.case_counts || {};
        const reportsArr = Object.entries(caseCounts).map(([date, count]) => ({
          date,
          count,
        }));
        setRecentReports(reportsArr);
      } catch (err) {
        console.error("[DEBUG] Recent Reports Fetch Error:", err); // Debug log
        setRecentReports([]);
      }
    }
    fetchRecentReports();
  }, [selectedBarangay]);

  // Add this effect to fetch recent dengue cases when a barangay is selected
  useEffect(() => {
    const fetchRecentDengueCases = async () => {
      if (selectedBarangay?.properties?.name) {
        try {
          const response = await getRecentReports(
            selectedBarangay.properties.name
          ).unwrap();
          setRecentDengueCases(response.reports.case_counts);
        } catch (error) {
          console.error("[DEBUG] Error fetching recent dengue cases:", error);
        }
      }
    };

    fetchRecentDengueCases();
  }, [selectedBarangay, getRecentReports]);

  // Add search handler
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!barangaysList) return;

    const q = (query || "").toLowerCase().trim();
    const filtered = barangaysList.filter((barangay) => {
      const name = barangay.name || "";
      const display = barangay.displayName || "";
      return (
        name.toLowerCase().includes(q) ||
        display.toLowerCase().includes(q) ||
        namesAreEquivalent(name, query) ||
        namesAreEquivalent(display, query)
      );
    });
    setFilteredBarangays(filtered);
  };

  const handleBarangaySelect = (barangay) => {
    if (!barangay) return;

    // If this is a GeoJSON feature (clicked on map)
    if (barangay.type === "Feature") {
      // Find matching barangay from barangaysList
      const matching = barangaysList?.find((b) =>
        namesAreEquivalent(b.name, barangay.properties?.name)
      );
      console.log("[DengueMapping] Map click select:", {
        featureName: barangay.properties?.name,
        matchedName: matching?.name,
        found: !!matching,
      });

      // Merge the data, ensuring all properties are properly set
      const merged = {
        ...barangay,
        properties: {
          ...barangay.properties,
          // Use canonical API name when available to avoid 'Sr' inconsistencies
          name: matching?.name || barangay.properties?.name,
          displayName:
            matching?.displayName ||
            matching?.name ||
            barangay.properties?.name,
          patternType:
            matching?.status_and_recommendation?.pattern_based?.status ||
            barangay.properties?.patternType ||
            "none",
          status_and_recommendation:
            matching?.status_and_recommendation ||
            barangay.properties?.status_and_recommendation,
          risk_level: matching?.risk_level || barangay.properties?.risk_level,
          pattern_data:
            matching?.pattern_data || barangay.properties?.pattern_data,
        },
      };

      setSelectedBarangay(merged);

      // Pan logic
      if (mapOnlyRef.current && barangay.geometry?.coordinates) {
        try {
          const centerFeature = center(barangay.geometry);
          const [lng, lat] = centerFeature.geometry.coordinates;
          if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            mapOnlyRef.current.panTo({ lat, lng });
            mapOnlyRef.current.setZoom(15);
          }
        } catch (error) {
          mapOnlyRef.current.panTo(QC_CENTER);
          mapOnlyRef.current.setZoom(13);
        }
      }
      return;
    }

    // If this is from the dropdown, find the matching GeoJSON feature
    fetch("/quezon_barangays_boundaries.geojson")
      .then((res) => res.json())
      .then((geoData) => {
        const feature = geoData.features.find((f) =>
          namesAreEquivalent(f.properties?.name, barangay.name)
        );

        if (feature) {
          // Create a GeoJSON feature with the barangay data
          const geoJSONFeature = {
            type: "Feature",
            properties: {
              ...feature.properties,
              name: barangay.name,
              displayName: barangay.displayName || barangay.name,
              patternType:
                barangay.status_and_recommendation?.pattern_based?.status ||
                "none",
              status_and_recommendation: barangay.status_and_recommendation,
              risk_level: barangay.risk_level,
              pattern_data: barangay.pattern_data,
            },
            geometry: feature.geometry,
          };

          // Call handleBarangaySelect again with the GeoJSON feature
          handleBarangaySelect(geoJSONFeature);
        } else {
          console.warn(
            "[DengueMapping] Dropdown select - no GeoJSON feature matched",
            {
              requestName: barangay.name,
            }
          );
        }
      })
      .catch((error) => {
        console.error("[DEBUG] Error fetching GeoJSON:", error);
      });
  };

  const handleShowOnMap = (item, type) => {
    setSelectedMapItem({ type, item });
    let coordinates;
    if (type === "report" && item.specific_location?.coordinates) {
      coordinates = item.specific_location.coordinates;
    } else if (type === "intervention" && item.specific_location?.coordinates) {
      coordinates = item.specific_location.coordinates;
    }
    if (mapOnlyRef.current && coordinates) {
      const position = {
        lat: coordinates[1],
        lng: coordinates[0],
      };
      mapOnlyRef.current.panTo(position);
      mapOnlyRef.current.setZoom(17);
      if (mapContainerRef.current) {
        mapContainerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  // Function to highlight a specific report marker
  const highlightReportMarker = (reportId) => {
    // This will be implemented in the MapContainer component
    // For now, we'll pass the reportId to the map component
    if (mapOnlyRef.current && mapOnlyRef.current.highlightMarker) {
      mapOnlyRef.current.highlightMarker(reportId);
    }
  };

  // Function to handle report removal from sub-cluster
  const handleReportRemovedFromSubCluster = (subClusterId, reportId) => {
    console.log(
      "Report removed from sub-cluster, refetching data:",
      subClusterId,
      reportId
    );

    // Refetch the specific cluster data to get updated sub-clusters
    if (refetchSpecificCluster) {
      refetchSpecificCluster();
    }

    // Also refetch the clusters list to update the overall cluster data
    // This will be handled automatically by the RTK Query cache invalidation
  };

  // Add handler for viewing full report
  const handleViewFullReport = async (report) => {
    try {
      setIsFetchingFullReport(true);
      setShowFullReport(true);
      // If we already have images and user fields, use as placeholder then hydrate
      setSelectedFullReport(report);
      const rid = report?._id || report?.id;
      if (!rid) return;
      const full = await triggerGetReportById(rid).unwrap();
      const data = full?.data || full; // support either {data} or raw
      if (data) setSelectedFullReport(data);
    } catch (e) {
      console.error("[Full Report] Failed to load full details", e);
    } finally {
      setIsFetchingFullReport(false);
    }
  };

  // Helper function to get border color based on pattern
  const getBorderColor = (patternType) => {
    switch (patternType?.toLowerCase()) {
      case "spike":
        return "border-error";
      case "increase":
        return "border-warning";
      case "decrease":
        return "border-success";
      case "low_level_activity":
        return "border-info";
      case "no_change":
        return "border-gray-400";
      default:
        return "border-gray-400";
    }
  };

  // Helper function to get text color based on pattern
  const getPatternTextColor = (patternType) => {
    switch (patternType?.toLowerCase()) {
      case "spike":
        return "text-error";
      case "increase":
        return "text-warning-content";
      case "decrease":
        return "text-success-content";
      case "low_level_activity":
        return "text-info";
      case "no_change":
        return "text-gray-400";
      default:
        return "text-gray-400";
    }
  };

  // Helper function to get background color based on pattern type
  const getPatternBgColor = (patternType) => {
    switch (patternType?.toLowerCase()) {
      case "spike":
        return "bg-error/20";
      case "increase":
        return "bg-warning";
      case "decrease":
        return "bg-success";
      case "low_level_activity":
        return "bg-info-content";
      case "no_change":
        return "bg-gray-200";
      default:
        return "bg-gray-400";
    }
  };

  const openStreetViewModal = () => {
    const streetViewElement = streetViewModalRef.current;
    if (
      streetViewElement &&
      selectedFullReport?.specific_location?.coordinates?.length === 2
    ) {
      streetViewElement.showModal();

      new window.google.maps.StreetViewPanorama(
        streetViewElement.querySelector("#street-view-container"),
        {
          position: {
            lat: selectedFullReport.specific_location.coordinates[1],
            lng: selectedFullReport.specific_location.coordinates[0],
          },
          pov: { heading: 165, pitch: 0 },
          zoom: 1,
          fullscreenControl: false,
        }
      );
    }
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

      // TODO: Replace with your actual API endpoint
      const response = await fetch("/api/dengue/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to import CSV file");
      }

      // Close modal and reset state
      setShowImportModal(false);
      setCsvFile(null);

      // Refresh data
      // TODO: Add your data refresh logic here
    } catch (error) {
      setImportError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <main className="flex flex-col w-full">
      <p className="flex justify-center text-5xl font-extrabold mb-12 text-center md:justify-start md:text-left md:w-[78%]">
        Mapping
      </p>

      <div className="relative mb-4 flex justify-between items-center">
        <BarangaySearch
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          filteredBarangays={filteredBarangays}
          handleBarangaySelect={handleBarangaySelect}
          setSearchQuery={setSearchQuery}
          setFilteredBarangays={setFilteredBarangays}
        />

        {/* CLUSTER REPORTED CONTAINER */}
        <ClusterDropdown
          showClusterDropdown={showClusterDropdown}
          setShowClusterDropdown={setShowClusterDropdown}
          flaggedClusters={flaggedClusters}
          pendingClusters={pendingClusters}
          partiallyResolvedClusters={partiallyResolvedClusters}
          fullyResolvedClusters={fullyResolvedClusters}
          isLoadingClusters={isLoadingClusters}
          zoomToCluster={zoomToCluster}
          handleViewClusterDetails={handleViewClusterDetails}
          getSeverityColor={getSeverityColor}
          getClusterStatus={getClusterStatus}
          getClusterStatusColor={getClusterStatusColor}
          formatDateRange={formatDateRange}
        />
      </div>

      <div className="relative">
        <MapContainer
          mapContainerRef={mapContainerRef}
          mapOnlyRef={mapOnlyRef}
          showBreedingSites={showBreedingSites}
          showInterventions={showInterventions}
          selectedBarangay={selectedBarangay}
          handleBarangaySelect={handleBarangaySelect}
          activeInterventions={activeInterventions}
          setSelectedFullReport={setSelectedFullReport}
          setShowFullReport={setShowFullReport}
          clusters={rawClusters}
          baseUrl="/admin/map"
        />

        {/* Map Controls Overlay - Top Left */}
        <div className="absolute top-4 left-4 z-10">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setShowBreedingSites(!showBreedingSites)}
                className={`px-3 py-2 rounded-lg transition-colors text-sm min-h-11 min-w-11 ${
                  showBreedingSites
                    ? "bg-primary text-white"
                    : "bg-white text-primary border border-gray-300 hover:bg-gray-50 shadow-md"
                }`}
              >
                {showBreedingSites
                  ? "Hide Breeding Sites"
                  : "Show Breeding Sites"}
              </button>
              <button
                onClick={() => setShowInterventions(!showInterventions)}
                className={`px-3 py-2 rounded-lg transition-colors text-sm min-h-11 min-w-11 ${
                  showInterventions
                    ? "bg-primary text-white"
                    : "bg-white text-primary border border-gray-300 hover:bg-gray-50 shadow-md"
                }`}
              >
                {showInterventions
                  ? "Hide Interventions"
                  : "Show Interventions"}
              </button>
            </div>

            {/* Legend */}
            {(showBreedingSites || showInterventions) && (
              <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200 max-w-xs">
                <p
                  className="text-md font-bold text-gray-700 mb-2"
                  role="heading"
                  aria-level={2}
                >
                  Map Legend
                </p>
                <div className="space-y-2">
                  {showBreedingSites && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Breeding Sites
                      </p>
                      <div className="grid grid-cols-1 gap-1 text-sm">
                        <div className="flex items-center gap-2">
                          <img
                            src={stagnantIcon}
                            alt="Stagnant Water"
                            className="w-3 h-3"
                          />
                          <span>Stagnant Water</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={garbageIcon}
                            alt="Garbage"
                            className="w-3 h-3"
                          />
                          <span>Garbage/Trash</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={othersIcon}
                            alt="Others"
                            className="w-3 h-3"
                          />
                          <span>Others</span>
                        </div>
                        {/* Cluster-specific legends */}
                        <div className="mt-2 pt-2 border-t border-gray-200" />
                        <div className="flex items-center gap-2">
                          {/* Violet marker chip to indicate cluster member */}
                          <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: "#8B5CF6" }}
                            aria-hidden
                          />
                          <span>Cluster Member Marker</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Orange small dot for pending badge */}
                          <span className="relative inline-flex items-center">
                            <span
                              className="inline-block w-3 h-3 rounded-full bg-white border"
                              aria-hidden
                            />
                            <span
                              className="inline-block w-2 h-2 rounded-full absolute -top-1 -right-1"
                              style={{
                                backgroundColor: "#f59e0b",
                                border: "1px solid #fff",
                              }}
                              aria-hidden
                            />
                          </span>
                          <span>Pending Status Indicator</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Green small dot for validated badge */}
                          <span className="relative inline-flex items-center">
                            <span
                              className="inline-block w-3 h-3 rounded-full bg-white border"
                              aria-hidden
                            />
                            <span
                              className="inline-block w-2 h-2 rounded-full absolute -top-1 -right-1"
                              style={{
                                backgroundColor: "#10b981",
                                border: "1px solid #fff",
                              }}
                              aria-hidden
                            />
                          </span>
                          <span>Validated Status Indicator</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Red circle swatch for active cluster circle */}
                          <span
                            className="inline-block w-3 h-3 rounded-full bg-white"
                            style={{ border: "2px solid #dc2626" }}
                            aria-hidden
                          />
                          <span>Cluster Area — Unchecked</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Red small dot for rejected badge */}
                          <span className="relative inline-flex items-center">
                            <span
                              className="inline-block w-3 h-3 rounded-full bg-white border"
                              aria-hidden
                            />
                            <span
                              className="inline-block w-2 h-2 rounded-full absolute -top-1 -right-1"
                              style={{
                                backgroundColor: "#dc2626",
                                border: "1px solid #fff",
                              }}
                              aria-hidden
                            />
                          </span>
                          <span>Rejected Status Indicator</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Green circle swatch for resolved cluster circle */}
                          <span
                            className="inline-block w-3 h-3 rounded-full bg-white"
                            style={{ border: "2px solid #10b981" }}
                            aria-hidden
                          />
                          <span>Cluster Area — Resolved</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {showInterventions && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Interventions
                      </p>
                      <div className="grid grid-cols-1 gap-1 text-sm">
                        <div className="flex items-center gap-2">
                          <img src={allIcon} alt="All" className="w-3 h-3" />
                          <span>All Interventions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={foggingIcon}
                            alt="Fogging"
                            className="w-3 h-3"
                          />
                          <span>Fogging</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={trappingIcon}
                            alt="Trapping"
                            className="w-3 h-3"
                          />
                          <span>Trapping</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={cleanUpIcon}
                            alt="Clean-up"
                            className="w-3 h-3"
                          />
                          <span>Clean-up Drive</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={educationIcon}
                            alt="Education"
                            className="w-3 h-3"
                          />
                          <span>Education Campaign</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <BarangayDetails
        selectedBarangay={selectedBarangay}
        getBorderColor={getBorderColor}
        getPatternTextColor={getPatternTextColor}
        reportsWithinBarangay={reportsWithinBarangay}
        reportsWithinBarangayLoading={isFetchingBarangayPosts}
        activeInterventions={activeInterventions}
        recentDengueCases={recentDengueCases}
        getPatternBgColor={getPatternBgColor}
        barangaysList={barangaysList}
        interventionsData={interventionsData}
        handleViewFullReport={handleViewFullReport}
        handleShowOnMap={handleShowOnMap}
        BREEDING_SITE_TYPE_ICONS={BREEDING_SITE_TYPE_ICONS}
      />

      {/* Cluster Details Modal */}
      <ClusterDetailsModal
        showClusterDetailsModal={showClusterDetailsModal}
        selectedCluster={specificClusterData || selectedCluster}
        setShowClusterDetailsModal={setShowClusterDetailsModal}
        getSeverityColor={getSeverityColor}
        formatDateRange={formatDateRange}
        getReportTypeColor={getReportTypeColor}
        selectedReports={selectedReports}
        resolvedReports={resolvedReports}
        rejectedReports={rejectedReports}
        pendingRejections={pendingRejections}
        pendingIndividualValidations={pendingIndividualValidations}
        handleReportSelection={handleReportSelection}
        handleClusterResolution={handleClusterResolution}
        openBulkConfirm={openBulkConfirm}
        handleIndividualValidation={handleIndividualValidation}
        getSelectedReportsCount={getSelectedReportsCount}
        getUnselectedReportsCount={getUnselectedReportsCount}
        getRejectedReportsCount={getRejectedReportsCount}
        getResolvedReportsCount={getResolvedReportsCount}
        hasResolvedReports={hasResolvedReports}
        canFormSubCluster={canFormSubCluster}
        getRemainingReports={getRemainingReports}
        subClusters={subClusters}
        mapOnlyRef={mapOnlyRef}
        highlightReportMarker={highlightReportMarker}
        onReportRemovedFromSubCluster={handleReportRemovedFromSubCluster}
        refetchSpecificCluster={refetchSpecificCluster}
        refetchGroupedReports={refetchGroupedReports}
        refetchClusters={refetchClusters}
      />

      {/* Loading Skeleton for Cluster Details */}
      {showClusterDetailsModal && isLoadingSpecificCluster && (
        <ClusterDetailsSkeleton
          open={showClusterDetailsModal}
          onClose={() => setShowClusterDetailsModal(false)}
        />
      )}

      {/* Main Report Modal */}
      <MainReportModal
        modalRef={modalRef}
        showFullReport={showFullReport}
        setShowFullReport={setShowFullReport}
        selectedFullReport={selectedFullReport}
        isFetchingFullReport={isFetchingFullReport}
        openStreetViewModal={openStreetViewModal}
        handleShowOnMap={handleShowOnMap}
      />

      {/* StreetView Modal */}
      <dialog ref={streetViewModalRef} className="modal z-[1000]">
        <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-5xl p-6 py-14 relative max-h-[85vh] overflow-y-auto">
          <button
            className="absolute top-4 right-4 text-2xl font-semibold hover:text-gray-500 transition-colors duration-200 hover:cursor-pointer"
            onClick={() => streetViewModalRef.current.close()}
          >
            ✕
          </button>

          {/* Reported Photos Section */}
          {selectedFullReport?.images &&
            selectedFullReport.images.length > 0 && (
              <div className="mb-6">
                <p className="text-xl font-bold mb-4">Reported Photos</p>
                <div className="grid grid-cols-3 gap-4">
                  {selectedFullReport.images.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img}
                        alt={`Reported Photo ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* StreetView Container */}
          <div className="space-y-4">
            <p className="text-xl font-bold">Street View</p>
            <p className="text-sm text-gray-600 -mt-2">
              Street View availability may vary by location. Imagery can take a
              few seconds to load; if it doesn’t appear, try zooming in, moving
              the map slightly, or closing and reopening.
            </p>
            <div
              id="street-view-container"
              className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg"
            />
          </div>
        </div>
      </dialog>

      {/* Import Modal */}
      <dialog
        ref={importModalRef}
        className="modal z-[1000]"
        open={showImportModal}
      >
        <div className="modal-box bg-white rounded-3xl shadow-3xl w-9/12 max-w-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">Import Dengue Cases</h3>

          <div className="mb-4">
            <p className="text-gray-600 mb-2">
              Upload a CSV file containing dengue case data.
            </p>
            <div className="text-sm text-gray-600 mb-4">
              <p className="font-semibold">CSV upload guidelines</p>
              <ul className="list-disc ml-5">
                <li>
                  Required columns: Barangay, Date (YYYY-MM-DD), Number of Cases
                </li>
                <li>
                  Optional column: Location (lat,lng) — e.g., 14.676,121.0437
                </li>
                <li>Header row required; values separated by commas</li>
                <li>Use UTF-8 encoding; no formulas/macros</li>
              </ul>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="file-input file-input-bordered w-full"
              />
              <a
                href="#"
                className="link text-sm text-primary"
                onClick={(e) => {
                  e.preventDefault();
                  const sample = [
                    "Barangay,Date,Number of Cases,Location",
                    "Batasan Hills,2025-06-01,12,14.676,121.0437",
                    "Commonwealth,2025-06-02,9,14.704,121.080",
                  ].join("\n");
                  const blob = new Blob([sample], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "buzzmap-cases-sample.csv";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
              >
                Download sample
              </a>
            </div>

            {importError && <p className="text-error mt-2">{importError}</p>}
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

      {/* Cluster Verification Modal */}
      <dialog open={bulkConfirm.open} className="modal z-[1000]">
        <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-3xl p-6 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xl font-bold text-primary">
              {bulkConfirm.action === "resolve-all"
                ? "Confirm Resolve All"
                : "Confirm Reject All"}
            </p>
            <button className="btn btn-ghost btn-sm" onClick={closeBulkConfirm}>
              ✕
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            {bulkConfirm.action === "resolve-all"
              ? "The following reports will be selected for resolution. This will not call the API until you click Resolve Selected in the details view."
              : "The following reports will be marked for rejection. You can still confirm or cancel each afterwards."}
          </p>

          <div className="border rounded-lg">
            <div className="px-3 py-2 bg-gray-50 border-b text-sm font-semibold text-gray-600">
              Reports affected ({bulkConfirm.reports.length})
            </div>
            <ul className="max-h-80 overflow-y-auto divide-y">
              {bulkConfirm.reports.map((r) => (
                <li
                  key={r.id}
                  className="px-4 py-2 text-sm flex items-center justify-between"
                >
                  <span className="truncate mr-2">
                    {r.type} • {r.description || "No description"}
                  </span>
                  <span className="text-sm text-gray-500">
                    {(() => {
                      const raw =
                        r.date || r.date_and_time || r.createdAt || r.updatedAt;
                      const d = raw ? new Date(raw) : null;
                      const isValid = d && !isNaN(d.getTime());
                      return isValid ? d.toLocaleString() : "—";
                    })()}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              className="btn btn-ghost"
              onClick={closeBulkConfirm}
              disabled={bulkConfirm.loading}
            >
              Cancel
            </button>
            <button
              className={`btn ${
                bulkConfirm.action === "resolve-all"
                  ? "btn-success"
                  : "btn-error"
              } ${bulkConfirm.loading ? "loading" : ""}`}
              onClick={confirmBulkAction}
              disabled={bulkConfirm.loading}
            >
              {bulkConfirm.loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Processing...
                </>
              ) : bulkConfirm.action === "resolve-all" ? (
                "Confirm Select All"
              ) : (
                "Confirm Reject All"
              )}
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );
};

export default DengueMapping;
