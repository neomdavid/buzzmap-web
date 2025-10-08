import {
  ImageGrid,
  ReportStatistics,
  ReportTable,
  ReportTable2,
  TableSkeleton,
} from "../../components";
import { useGetGroupedReportsQuery } from "../../api/dengueApi.js";
import { useState, useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import ClusterTable from "../../components/Admin/ClusterTable";

// AG Grid React cell renderers for clusters table
const ClusterStatusCell = (params) => {
  const validated = params.data?.validated || 0;
  const rejected = params.data?.rejected || 0;
  const total = params.data?.total || 0;

  // Debug logging to see what data we're getting (commented out to prevent performance issues)
  // console.log("ClusterStatusCell debug:", {
  //   clusterId: params.data?.id,
  //   validated,
  //   rejected,
  //   total,
  //   rawData: params.data,
  // });

  // Determine the primary status and badge styling
  let statusText, badgeClass;

  if (total === 0) {
    statusText = "No reports";
    badgeClass = "badge-ghost";
  } else if (validated === total) {
    statusText = `${validated} of ${total} validated`;
    badgeClass = "badge-success";
  } else if (rejected === total) {
    statusText = `${rejected} of ${total} rejected`;
    badgeClass = "badge-error text-white";
  } else {
    // Mixed status or all pending - always show validated count
    statusText = `${validated} of ${total} validated`;
    badgeClass = validated > 0 ? "badge-warning" : "badge-ghost";
  }

  return <span className={`badge ${badgeClass}`}>{statusText}</span>;
};

const ClusterActionsCell = (params) => {
  return (
    <button
      className="btn btn-sm btn-outline whitespace-nowrap flex items-center justify-center gap-1 h-full"
      onClick={() => params.context?.openClusterDetails?.(params.data?.__raw)}
    >
      <IconSearch size={13} stroke={2.5} />
      <span>view</span>
    </button>
  );
};
import post1 from "../../assets/post1.jpg";
import post2 from "../../assets/post2.jpg";
import VerifyReportModal from "../../components/Admin/VerifyReportModal";
import dayjs from "dayjs";
import {
  IconChartBar,
  IconChecks,
  IconClock,
  IconUserCircle,
  IconSearch,
  IconMapPin,
  IconCircle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const ReportsVerification = () => {
  // Get token from Redux state instead of localStorage
  const token = useSelector((state) => state.auth.token);

  const {
    data: groupedReportsData,
    isLoading: isLoadingGrouped,
    refetch: refetchGrouped,
  } = useGetGroupedReportsQuery();
  const [selectedReport, setSelectedReport] = useState(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const [clusterDetails, setClusterDetails] = useState({
    open: false,
    cluster: null,
  });
  const [clusterBatchConfirm, setClusterBatchConfirm] = useState({
    open: false,
    mode: null, // 'all' | 'remaining'
    ids: [],
    loading: false,
  });
  const [viewMode, setViewMode] = useState("individual"); // 'individual' | 'clusters'
  const [showValidationGuide, setShowValidationGuide] = useState(false);

  // AG Grid config for cluster reports modal
  const clusterReportsTheme = useMemo(
    () =>
      themeQuartz.withParams({
        borderRadius: 10,
        columnBorder: false,
        fontFamily: "inherit",
        headerFontSize: 14,
        headerFontWeight: 700,
        headerRowBorder: false,
        headerVerticalPaddingScale: 1.1,
        headerTextColor: "var(--color-base-content)",
        spacing: 11,
        wrapperBorder: false,
        wrapperBorderRadius: 0,
      }),
    []
  );

  const clusterReports = useMemo(() => {
    return Array.isArray(clusterDetails?.cluster?.reports)
      ? clusterDetails.cluster.reports.filter((r) => r?.isResolved === true)
      : [];
  }, [clusterDetails?.cluster?.reports]);

  const modalReportsRowData = useMemo(() => {
    return clusterReports.map((r, idx) => {
      const status = r.status || r.report_status || "Pending";
      const date = r.date_and_time || r.date;
      return {
        id: r._id || r.id || idx,
        __raw: r,
        type: r.report_type || r.type || "-",
        description: r.description || r.desc || r.content || "-",
        status,
        dateFormatted: date
          ? new Date(date).toLocaleString("en-US", {
              weekday: "short",
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })
          : "-",
      };
    });
  }, [clusterReports]);

  const StatusBadgeCell = (params) => {
    const s = params.data?.status;
    const cls =
      s === "Validated"
        ? "badge-success"
        : s === "Rejected"
        ? "badge-error text-white"
        : "badge-warning";
    return <span className={`badge ${cls}`}>{s}</span>;
  };

  const ViewDetailsCell = (params) => (
    <button
      className="flex items-center justify-center gap-1 text-primary hover:bg-gray-200 p-1 rounded-md hover:cursor-pointer h-full"
      onClick={() => setSelectedReport(params.data?.__raw)}
    >
      <IconSearch size={13} stroke={2.5} />
      <span className="text-sm">view</span>
    </button>
  );

  const modalReportsColDefs = useMemo(
    () => [
      { headerName: "Type", field: "type", flex: 1 },
      { headerName: "Description", field: "description", flex: 2 },
      {
        headerName: "Status",
        field: "status",
        width: 130,
        cellRenderer: StatusBadgeCell,
      },
      {
        headerName: "Date",
        field: "dateFormatted",
        flex: 1,
        filter: "agDateColumnFilter",
        valueGetter: (p) => {
          // Provide actual Date object for filter comparisons
          const raw = p.data?.__raw;
          const d = raw?.date_and_time || raw?.date;
          return d ? new Date(d) : null;
        },
        valueFormatter: (p) => p.data?.dateFormatted || "-",
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 150,
        cellRenderer: ViewDetailsCell,
        filter: false,
        sortable: false,
        suppressMenu: true,
      },
    ],
    []
  );

  // Utilities placed before usage to avoid temporal dead zone
  const formatDateRangeTop = (start, end) => {
    if (!start || !end) return "-";
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s) || isNaN(e)) return "-";
    if (s.toDateString() === e.toDateString())
      return s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth())
      return `${s.toLocaleDateString("en-US", {
        month: "short",
      })} ${s.getDate()} - ${e.getDate()}`;
    if (s.getFullYear() === e.getFullYear())
      return `${s.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${e.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    return `${s.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} - ${e.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  const deriveClusterCountsTop = (cluster) => {
    const reports = Array.isArray(cluster?.reports) ? cluster.reports : [];

    // Filter to only include resolved reports (isResolved: true)
    const resolvedReports = reports.filter((r) => r?.isResolved === true);
    const total = resolvedReports.length;

    // Debug: log all report statuses (commented out to prevent performance issues)
    // console.log("deriveClusterCountsTop debug:", {
    //   clusterId: cluster?._id || cluster?.id,
    //   totalReports: reports.length,
    //   resolvedReports: total,
    //   reportStatuses: resolvedReports.map((r) => ({
    //     id: r._id || r.id,
    //     status: r?.status || r?.report_status || "undefined",
    //     isResolved: r?.isResolved,
    //     hasStatus: !!(r?.status || r?.report_status),
    //   })),
    // });

    const validated = resolvedReports.filter((r) => {
      const s = r?.status || r?.report_status;
      return s === "Validated";
    }).length;
    const rejected = resolvedReports.filter((r) => {
      const s = r?.status || r?.report_status;
      return s === "Rejected";
    }).length;
    const pending = resolvedReports.filter((r) => {
      const s = r?.status || r?.report_status;
      return s === "Pending" || !s;
    }).length;
    const unprocessed = Math.max(0, total - validated);

    // console.log("Cluster counts result:", {
    //   clusterId: cluster?._id || cluster?.id,
    //   total,
    //   validated,
    //   rejected,
    //   pending,
    //   unprocessed,
    // });

    return { total, validated, rejected, pending, unprocessed };
  };

  // Grouped data selections (must be declared before any effects using them)
  const individualReports = useMemo(() => {
    return Array.isArray(groupedReportsData?.individual_reports)
      ? groupedReportsData.individual_reports
      : [];
  }, [groupedReportsData?.individual_reports]);

  const clustersList = useMemo(() => {
    const rawClusters = Array.isArray(groupedReportsData?.clusters)
      ? groupedReportsData.clusters
      : [];

    return rawClusters.filter((cluster) => {
      const reports = Array.isArray(cluster?.reports) ? cluster.reports : [];
      const resolvedReports = reports.filter((r) => r?.isResolved === true);
      return resolvedReports.length > 0;
    });
  }, [groupedReportsData?.clusters]);

  // Clusters AG Grid data and columns (memoized to prevent infinite re-renders)
  const clustersRowData = useMemo(() => {
    return (clustersList || []).map((c) => {
      const counts = deriveClusterCountsTop(c);
      const dateRange = c?.date_range || {};
      return {
        __raw: c,
        id: c._id || c.id || c.parentClusterId,
        barangay: c.barangay || "Unknown",
        dateRange: formatDateRangeTop(dateRange.start_date, dateRange.end_date),
        total: counts.total,
        validated: counts.validated,
        rejected: counts.rejected,
        pending: counts.pending,
        unprocessed: counts.unprocessed,
      };
    });
  }, [clustersList]);

  const clustersColumnDefs = useMemo(
    () => [
      { headerName: "Barangay", field: "barangay", flex: 1 },
      { headerName: "Date Range", field: "dateRange", flex: 1 },
      { headerName: "Total", field: "total", width: 110 },
      {
        headerName: "Validated",
        field: "validated",
        width: 140,
        cellClass: "text-success",
      },
      {
        headerName: "Unprocessed",
        field: "unprocessed",
        width: 160,
        cellClass: "text-gray-500",
      },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        cellRenderer: ClusterStatusCell,
      },
      {
        headerName: "Actions",
        field: "actions",
        width: 170,
        cellRenderer: ClusterActionsCell,
      },
    ],
    []
  );

  const clustersDefaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
    }),
    []
  );

  // Keep cluster details modal in sync after refetches
  useEffect(() => {
    if (!clusterDetails.open) return;
    const clusters = clustersList;
    if (!Array.isArray(clusters)) return;
    const currentId =
      clusterDetails.cluster?.parentClusterId ||
      clusterDetails.cluster?._id ||
      clusterDetails.cluster?.id;
    if (!currentId) return;
    const updated = clusters.find(
      (c) => (c.parentClusterId || c._id || c.id) === currentId
    );
    if (!updated) return;

    // Guard: only update when meaningful fields change to avoid render loops
    const prevCluster = clusterDetails.cluster || {};
    const prevReports = Array.isArray(prevCluster.reports)
      ? prevCluster.reports
      : [];
    const updatedReports = Array.isArray(updated.reports)
      ? updated.reports
      : [];

    const prevTotal = prevReports.length;
    const nextTotal = updatedReports.length;
    const prevValidated = prevReports.filter(
      (r) => (r.status || r.report_status) === "Validated"
    ).length;
    const nextValidated = updatedReports.filter(
      (r) => (r.status || r.report_status) === "Validated"
    ).length;

    if (prevTotal === nextTotal && prevValidated === nextValidated) return;

    setClusterDetails((prev) => ({ ...prev, cluster: updated }));
  }, [clustersList, clusterDetails.open]);

  // (moved up) individualReports and clustersList already defined above

  const formatDateRange = (start, end) => {
    if (!start || !end) return "-";
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s) || isNaN(e)) return "-";
    if (s.toDateString() === e.toDateString())
      return s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth())
      return `${s.toLocaleDateString("en-US", {
        month: "short",
      })} ${s.getDate()} - ${e.getDate()}`;
    if (s.getFullYear() === e.getFullYear())
      return `${s.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${e.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`;
    return `${s.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} - ${e.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  };

  const deriveClusterCounts = (cluster) => {
    const reports = Array.isArray(cluster?.reports) ? cluster.reports : [];
    const total = reports.length;
    const validated = reports.filter((r) => {
      const s = r?.status || r?.report_status;
      return s === "Validated";
    }).length;
    const unprocessed = Math.max(0, total - validated);
    return { total, validated, unprocessed };
  };

  // Calculate summary stats from grouped individual reports only
  const totalReports = individualReports?.length || 0;
  const totalValidated =
    individualReports?.filter((p) => p.status === "Validated").length || 0;
  const totalPending =
    individualReports?.filter((p) => p.status === "Pending").length || 0;
  const totalRejected =
    individualReports?.filter((p) => p.status === "Rejected").length || 0;
  const today = dayjs().format("YYYY-MM-DD");
  const totalToday =
    individualReports?.filter(
      (p) => dayjs(p.date_and_time).format("YYYY-MM-DD") === today
    ).length || 0;

  // Most active barangay
  const mostActiveBarangay = useMemo(() => {
    const counts = {};
    (individualReports || []).forEach((p) => {
      if (p.barangay) counts[p.barangay] = (counts[p.barangay] || 0) + 1;
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return top || "N/A";
  }, [individualReports]);

  const handleVerificationSuccess = async () => {
    setIsRefetching(true);
    try {
      await refetchGrouped?.();

      // If cluster details modal is open, update its data
      if (clusterDetails.open && clusterDetails.cluster) {
        const updatedClusters = Array.isArray(groupedReportsData?.clusters)
          ? groupedReportsData.clusters
          : clustersList;
        const currentClusterId =
          clusterDetails.cluster.parentClusterId ||
          clusterDetails.cluster._id ||
          clusterDetails.cluster.id;
        const updatedCluster = updatedClusters.find(
          (c) => (c.parentClusterId || c._id || c.id) === currentClusterId
        );
        if (updatedCluster) {
          setClusterDetails((prev) => ({ ...prev, cluster: updatedCluster }));
        }
      }
    } finally {
      setIsRefetching(false);
    }
    setSelectedReport(null);
  };

  if (isLoadingGrouped) {
    return (
      <main className="flex flex-col w-full">
        <p className="flex justify-center text-5xl font-extrabold mb-10 text-center md:justify-start md:text-left md:w-[100%] ">
          Reports Verification
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

        <div className="flex flex-col">
          <section className="flex flex-col gap-2">
            <p className="text-base-content text-4xl font-bold mb-2">
              Breeding Site Reports
            </p>
            <div className="h-[75vh]">
              <TableSkeleton rows={10} columns={5} />
            </div>
          </section>
        </div>
      </main>
    );
  }

  // No explicit error state available here; optionally render nothing if no data

  return (
    <main className="flex flex-col w-full">
      <p className="flex justify-center text-5xl font-extrabold mb-10 text-center md:justify-start md:text-left md:w-[48%] ">
        Reports Verification
      </p>

      {/* --- SUMMARY CARDS --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {/* Total Reports */}
        <div className="flex flex-col text-center rounded-2xl shadow bg-base-100 border border-base-200 px-6 py-5 items-center">
          <IconChartBar size={28} className="text-primary mb-1" />
          <span className="text-3xl font-bold text-primary">
            {totalReports}
          </span>
          <span className="text-base font-medium text-gray-600 mt-1">
            Total Reports
          </span>
        </div>
        {/* Validated */}
        <div className="flex flex-col text-center rounded-2xl shadow bg-green-50 border border-green-100 px-6 py-5 items-center">
          <IconChecks size={28} className="text-green-600 mb-1" />
          <span className="text-3xl font-bold text-green-600">
            {totalValidated}
          </span>
          <span className="text-base font-medium text-green-700 mt-1">
            Validated
          </span>
        </div>
        {/* Pending */}
        <div className="flex flex-col text-center rounded-2xl shadow bg-yellow-50 border border-yellow-100 px-6 py-5 items-center">
          <IconClock size={28} className="text-yellow-600 mb-1" />
          <span className="text-3xl font-bold text-yellow-600">
            {totalPending}
          </span>
          <span className="text-base font-medium text-yellow-700 mt-1">
            Pending
          </span>
        </div>
        {/* Rejected */}
        <div className="flex flex-col text-center rounded-2xl shadow bg-red-50 border border-red-100 px-6 py-5 items-center">
          <IconUserCircle size={28} className="text-red-600 mb-1" />
          <span className="text-3xl font-bold text-red-600">
            {totalRejected}
          </span>
          <span className="text-base font-medium text-red-700 mt-1">
            Rejected
          </span>
        </div>
        {/* Reports Today */}
        <div className="flex flex-col text-center rounded-2xl shadow bg-blue-50 border border-blue-100 px-6 py-5 items-center">
          <IconClock size={28} className="text-blue-600 mb-1" />
          <span className="text-3xl font-bold text-blue-600">{totalToday}</span>
          <span className="text-base font-medium text-blue-700 mt-1">
            Reports Today
          </span>
        </div>
        {/* Most Active Barangay */}
        <div className="flex flex-col text-center rounded-2xl shadow bg-purple-50 border border-purple-100 px-6 py-5 items-center">
          <IconUserCircle size={28} className="text-purple-600 mb-1" />
          <span className="text-2xl font-bold text-purple-700">
            {mostActiveBarangay}
          </span>
          <span className="text-base font-medium text-purple-700 mt-1">
            Most Active Barangay
          </span>
        </div>
      </div>
      {/* --- END SUMMARY CARDS --- */}

      {/* View toggle - segmented control */}
      <div className="mb-6 flex items-center">
        <div className="join bg-base-200 rounded-2xl p-1.5">
          <button
            className={`join-item btn btn-md rounded-xl gap-2 px-4 ${
              viewMode === "individual" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setViewMode("individual")}
            aria-pressed={viewMode === "individual"}
          >
            <IconMapPin size={18} />
            <span>Individual</span>
          </button>
          <button
            className={`join-item btn btn-md rounded-xl gap-2 px-4 ${
              viewMode === "clusters" ? "btn-primary" : "btn-ghost"
            }`}
            onClick={() => setViewMode("clusters")}
            aria-pressed={viewMode === "clusters"}
          >
            <IconCircle size={18} />
            <span>Clusters</span>
          </button>
        </div>
      </div>

      {viewMode === "individual" ? (
        <div className="flex flex-col">
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-base-content text-4xl font-bold">
                Breeding Site Reports
              </p>
              <button
                className="inline-flex items-center gap-1.5 text-sm link text-primary hover:text-accent"
                onClick={() => setShowValidationGuide(true)}
                aria-label="How do I validate a report?"
                title="How do I validate a report?"
              >
                <IconInfoCircle size={16} />
                <span>How do I validate a report?</span>
              </button>
            </div>
            <div className="h-[75vh]">
              {isLoadingGrouped ? (
                <TableSkeleton rows={10} columns={5} />
              ) : (
                <ReportTable2
                  posts={individualReports}
                  onSelectReport={setSelectedReport}
                  onSuccess={handleVerificationSuccess}
                  isRefetching={isRefetching}
                  paginationPageSize={10}
                  paginationPageSizeOptions={[10, 20, 50, 100]}
                />
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="flex flex-col">
          <section className="flex flex-col gap-2">
            <p className="text-base-content text-4xl font-bold mb-2">
              Clusters
            </p>
            <ClusterTable
              clustersList={clustersList}
              onOpenDetails={(cluster) =>
                setClusterDetails({ open: true, cluster })
              }
            />
          </section>
        </div>
      )}
      {clusterDetails.open && (
        <dialog open className="modal z-[1000]">
          <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-6xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xl font-bold text-primary">Cluster Reports</p>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setClusterDetails({ open: false, cluster: null })
                }
              >
                ✕
              </button>
            </div>
            <div
              className="ag-theme-quartz w-full rounded-2xl"
              style={{ height: "60vh" }}
            >
              <AgGridReact
                rowData={modalReportsRowData}
                columnDefs={modalReportsColDefs}
                defaultColDef={{
                  sortable: true,
                  resizable: true,
                  filter: true,
                }}
                theme={clusterReportsTheme}
                suppressCellFocus={true}
                animateRows={true}
                pagination={true}
                paginationPageSize={10}
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              {(() => {
                const reports = Array.isArray(clusterDetails.cluster?.reports)
                  ? clusterDetails.cluster.reports
                  : [];
                const total = reports.length;
                const remaining = reports.filter(
                  (r) => (r.status || r.report_status) !== "Validated"
                ).length;
                const validated = Math.max(0, total - remaining);
                const rejected = reports.filter(
                  (r) => (r.status || r.report_status) === "Rejected"
                ).length;
                const allFinalized = remaining === 0;
                const allRejected = rejected === total;
                const allValidated = validated === total;
                const showBatchActions = !allRejected && !allValidated;

                console.log("Cluster batch actions debug:", {
                  reports,
                  total,
                  remaining,
                  validated,
                  rejected,
                  allFinalized,
                  allRejected,
                  allValidated,
                  showBatchActions,
                  reportStatuses: reports.map((r) => ({
                    id: r._id || r.id,
                    status: r.status || r.report_status,
                  })),
                });

                return (
                  <>
                    {showBatchActions && (
                      <>
                        {validated === 0 && !allFinalized ? (
                          <button
                            className="btn btn-success btn-sm whitespace-nowrap"
                            disabled={total === 0}
                            onClick={() => {
                              const ids = reports
                                .map((r) => r._id || r.id)
                                .filter(Boolean);
                              console.log("Validate All clicked:", {
                                ids,
                                total,
                              });
                              setClusterBatchConfirm({
                                open: true,
                                mode: "all",
                                ids,
                                loading: false,
                              });
                            }}
                          >
                            Validate All ({total})
                          </button>
                        ) : !allFinalized ? (
                          <button
                            className="btn btn-primary btn-sm whitespace-nowrap"
                            disabled={remaining === 0}
                            onClick={() => {
                              const ids = reports
                                .filter(
                                  (r) =>
                                    (r.status || r.report_status) !==
                                    "Validated"
                                )
                                .map((r) => r._id || r.id)
                                .filter(Boolean);
                              console.log("Validate Remaining clicked:", {
                                ids,
                                remaining,
                              });
                              setClusterBatchConfirm({
                                open: true,
                                mode: "remaining",
                                ids,
                                loading: false,
                              });
                            }}
                          >
                            Validate Remaining ({remaining})
                          </button>
                        ) : null}
                        {validated !== total && (
                          <button
                            className="btn btn-error btn-sm whitespace-nowrap"
                            onClick={() => {
                              const ids = (
                                Array.isArray(reports) ? reports : []
                              )
                                .filter(
                                  (r) =>
                                    (r.status || r.report_status) !== "Rejected"
                                )
                                .map((r) => r._id || r.id)
                                .filter(Boolean);
                              console.log("Reject All clicked:", { ids });
                              setClusterBatchConfirm({
                                open: true,
                                mode: "reject-all",
                                ids,
                                loading: false,
                              });
                            }}
                            disabled={(Array.isArray(reports)
                              ? reports
                              : []
                            ).every(
                              (r) =>
                                (r.status || r.report_status) === "Rejected"
                            )}
                          >
                            Reject All
                          </button>
                        )}
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button
              onClick={() => setClusterDetails({ open: false, cluster: null })}
            >
              close
            </button>
          </form>
        </dialog>
      )}
      {clusterBatchConfirm.open && (
        <dialog open className="modal z-[1100]">
          <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-md p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-lg font-bold text-primary">
                Confirm Validation
              </p>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  setClusterBatchConfirm({
                    open: false,
                    mode: null,
                    ids: [],
                    loading: false,
                  })
                }
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {clusterBatchConfirm.mode === "all"
                ? `Validate all ${clusterBatchConfirm.ids.length} reports in this cluster?`
                : clusterBatchConfirm.mode === "remaining"
                ? `Validate remaining ${clusterBatchConfirm.ids.length} reports in this cluster?`
                : `Reject all ${clusterBatchConfirm.ids.length} reports in this cluster?`}
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-ghost"
                onClick={() =>
                  setClusterBatchConfirm({
                    open: false,
                    mode: null,
                    ids: [],
                    loading: false,
                  })
                }
                disabled={clusterBatchConfirm.loading}
              >
                Cancel
              </button>
              <button
                className={`btn ${
                  clusterBatchConfirm.mode === "reject-all"
                    ? "btn-error"
                    : "btn-success"
                } ${clusterBatchConfirm.loading ? "loading" : ""}`}
                onClick={async () => {
                  console.log("Batch confirm clicked:", {
                    mode: clusterBatchConfirm.mode,
                    ids: clusterBatchConfirm.ids,
                    idsLength: clusterBatchConfirm.ids.length,
                  });

                  setClusterBatchConfirm((p) => ({ ...p, loading: true }));
                  try {
                    console.log("Using token from Redux state:", {
                      hasToken: !!token,
                      tokenLength: token?.length,
                      tokenPreview: token
                        ? token.substring(0, 20) + "..."
                        : null,
                    });

                    if (!token) {
                      console.error(
                        "No authentication token found in Redux state"
                      );
                      toast.error(
                        "Authentication required. Please log in again."
                      );
                      return;
                    }

                    const desiredStatus =
                      clusterBatchConfirm.mode === "reject-all"
                        ? "Rejected"
                        : "Validated";

                    console.log("Making API call:", {
                      url: "https://buzzmap-backend.onrender.com/api/v1/reports/bulk-validate",
                      method: "PATCH",
                      reportIds: clusterBatchConfirm.ids,
                      status: desiredStatus,
                      hasToken: !!token,
                      tokenLength: token.length,
                    });

                    const response = await fetch(
                      "https://buzzmap-backend.onrender.com/api/v1/reports/bulk-validate",
                      {
                        method: "PATCH",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: token ? `Bearer ${token}` : "",
                        },
                        body: JSON.stringify({
                          reportIds: clusterBatchConfirm.ids,
                          status: desiredStatus,
                        }),
                      }
                    );

                    console.log("API response:", {
                      status: response.status,
                      statusText: response.statusText,
                      ok: response.ok,
                    });

                    if (!response.ok) {
                      const errorText = await response.text();
                      console.error("API error:", errorText);

                      let errorMessage = "Failed to update reports";
                      if (response.status === 401) {
                        errorMessage =
                          "Authentication expired. Please log in again.";
                      } else if (response.status === 403) {
                        errorMessage =
                          "You don't have permission to perform this action.";
                      } else if (response.status >= 500) {
                        errorMessage = "Server error. Please try again later.";
                      }

                      toast.error(errorMessage);
                      throw new Error(
                        `API error: ${response.status} ${response.statusText}`
                      );
                    }

                    const result = await response.json();
                    console.log("API success result:", result);

                    // Show success message
                    const actionText =
                      clusterBatchConfirm.mode === "reject-all"
                        ? "rejected"
                        : "validated";
                    toast.success(
                      `Successfully ${actionText} ${
                        result.results?.updated?.length ||
                        clusterBatchConfirm.ids.length
                      } reports.`
                    );

                    await refetchGrouped?.();
                    console.log("Refetch completed");
                  } catch (error) {
                    console.error("Batch action error:", error);
                    // Don't show toast again if we already showed one above
                    if (!error.message.includes("API error")) {
                      toast.error(
                        "An unexpected error occurred. Please try again."
                      );
                    }
                  } finally {
                    setClusterBatchConfirm({
                      open: false,
                      mode: null,
                      ids: [],
                      loading: false,
                    });
                  }
                }}
                disabled={clusterBatchConfirm.loading}
              >
                {clusterBatchConfirm.loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </dialog>
      )}
      {showValidationGuide && (
        <dialog open className="modal z-[1200]">
          <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-3xl p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <IconInfoCircle size={22} className="text-primary" />
                <p className="text-xl font-bold text-primary">
                  Report Validation Guide
                </p>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowValidationGuide(false)}
                aria-label="Close validation guide"
              >
                ✕
              </button>
            </div>
            <div className="prose max-w-none text-primary">
              <p className="mb-2">
                Use this checklist to decide whether to{" "}
                <span className="font-semibold">Validate</span> or{" "}
                <span className="font-semibold">Reject</span> a report.
              </p>
              <h3 className="text-lg font-bold mt-3">Validation criteria</h3>
              <ul className="list-disc ml-5">
                <li>
                  <span className="font-semibold">Location precision:</span> pin
                  coordinates exist and match the described address or visible
                  place.
                </li>
                <li>
                  <span className="font-semibold">Evidence quality:</span> clear
                  images (if provided) support the description; not AI-generated
                  or duplicated.
                </li>
                <li>
                  <span className="font-semibold">Report completeness:</span>{" "}
                  barangay, description, and date/time are present and
                  reasonable.
                </li>
                <li>
                  <span className="font-semibold">Recency & relevance:</span>{" "}
                  occurred within a relevant timeframe (e.g., last 30 days) and
                  relates to breeding sites or mosquito hotspots.
                </li>
                <li>
                  <span className="font-semibold">Duplicates:</span> not an
                  exact duplicate of an already validated report at the same
                  spot/time.
                </li>
                <li>
                  <span className="font-semibold">Clusters:</span> reports in a
                  cluster typically describe the same incident. Prefer
                  validating the best-evidence report and mark exact duplicates
                  as duplicates (reject as duplicate). Avoid double-counting.
                </li>
                <li>
                  <span className="font-semibold">Integrity flags:</span>{" "}
                  content isn’t spam, malicious, or violating policy.
                </li>
              </ul>
              <h3 className="text-lg font-bold mt-4">
                Suggested validation flow
              </h3>
              <ol className="list-decimal ml-5">
                <li>
                  Open the report details via{" "}
                  <span className="font-semibold">View</span> and inspect
                  description, images, and timestamp.
                </li>
                <li>
                  Cross-check the location on the map; zoom in to verify
                  coordinates and nearby landmarks.
                </li>
                <li>
                  Check for duplicates or cluster membership; for clustered
                  duplicates validate one canonical report and reject the rest
                  as duplicates.
                </li>
                <li>
                  If sufficient and credible, click{" "}
                  <span className="font-semibold">Validate</span>; otherwise
                  choose <span className="font-semibold">Reject</span> with a
                  brief reason.
                </li>
              </ol>
              <h3 className="text-lg font-bold mt-4">Tips</h3>
              <ul className="list-disc ml-5">
                <li>
                  Favor <span className="font-semibold">Validated</span> only
                  when evidence and context are clear.
                </li>
                <li>
                  Use <span className="font-semibold">Reject</span> for spam,
                  irrelevant, or unverifiable submissions.
                </li>
              </ul>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                className="btn btn-primary"
                onClick={() => setShowValidationGuide(false)}
              >
                Got it
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowValidationGuide(false)}>close</button>
          </form>
        </dialog>
      )}
      {selectedReport && (
        <>
          {console.log("Selected report data for admin:", {
            id: selectedReport._id,
            isAnonymous: selectedReport.isAnonymous,
            user: selectedReport.user,
            displayUser: selectedReport.displayUser,
            anonymousId: selectedReport.anonymousId,
            username: selectedReport.user?.username,
          })}
          <VerifyReportModal
            reportId={selectedReport._id}
            barangay={selectedReport.barangay}
            description={selectedReport.description}
            status={selectedReport.status}
            dateAndTime={selectedReport.date_and_time}
            images={selectedReport.images}
            coordinates={selectedReport.specific_location?.coordinates}
            username={selectedReport.user?.username || "Unknown"}
            isAnonymous={selectedReport.isAnonymous}
            onClose={() => setSelectedReport(null)}
            onSuccess={handleVerificationSuccess}
          />
        </>
      )}
    </main>
  );
};

export default ReportsVerification;
