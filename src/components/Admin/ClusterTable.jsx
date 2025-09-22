import React, { useEffect, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { IconSearch } from "@tabler/icons-react";

const ClusterStatusCell = (params) => {
  const validated = params.data?.validated || 0;
  const rejected = params.data?.rejected || 0;
  const total = params.data?.total || 0;

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
    badgeClass = "badge-error";
  } else {
    // Mixed status or all pending - always show validated count
    statusText = `${validated} of ${total} validated`;
    badgeClass = validated > 0 ? "badge-warning" : "badge-ghost";
  }

  return <span className={`badge ${badgeClass}`}>{statusText}</span>;
};

const ClusterActionsCell = (params) => (
  <button
    className="flex items-center gap-1 text-primary hover:bg-gray-200 p-1 rounded-md hover:cursor-pointer"
    onClick={() => params.context?.openClusterDetails?.(params.data?.__raw)}
  >
    <IconSearch size={13} stroke={2.5} />
    <span className="text-sm">view</span>
  </button>
);

const formatDateRange = (start, end, fallbackReports) => {
  let s = start ? new Date(start) : null;
  let e = end ? new Date(end) : null;
  if (!s || isNaN(s) || !e || isNaN(e)) {
    const dates = Array.isArray(fallbackReports)
      ? fallbackReports
          .map((r) => r?.date_and_time || r?.date)
          .filter(Boolean)
          .map((d) => new Date(d))
          .filter((d) => !isNaN(d))
      : [];
    if (dates.length > 0) {
      s = new Date(Math.min(...dates));
      e = new Date(Math.max(...dates));
    }
  }
  if (!s || !e || isNaN(s) || isNaN(e)) return "-";
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
    })} - ${e.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
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

  // Filter to only include resolved reports (isResolved: true)
  const resolvedReports = reports.filter((r) => r?.isResolved === true);
  const total = resolvedReports.length;

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
  return { total, validated, rejected, pending, unprocessed };
};

function ClusterTable({ clustersList = [], onOpenDetails }) {
  // Filter out clusters that don't have any resolved reports (memoized)
  const filteredClustersList = useMemo(() => {
    return clustersList.filter((cluster) => {
      const reports = Array.isArray(cluster?.reports) ? cluster.reports : [];
      const resolvedReports = reports.filter((r) => r?.isResolved === true);
      return resolvedReports.length > 0;
    });
  }, [clustersList]);

  const rowData = useMemo(() => {
    return (filteredClustersList || []).map((c) => {
      const counts = deriveClusterCounts(c);
      const dateRange = c?.date_range || {};
      const reports = Array.isArray(c?.reports) ? c.reports : [];
      const latest = (() => {
        const ds = reports
          .map((r) => r?.date_and_time || r?.date)
          .filter(Boolean)
          .map((d) => new Date(d))
          .filter((d) => !isNaN(d));
        if (ds.length === 0) return null;
        return new Date(Math.max(...ds));
      })();
      return {
        __raw: c,
        id: c._id || c.id || c.parentClusterId,
        barangay: c.barangay || "Unknown",
        dateRange: formatDateRange(
          dateRange.start_date,
          dateRange.end_date,
          reports
        ),
        total: counts.total,
        validated: counts.validated,
        rejected: counts.rejected,
        pending: counts.pending,
        unprocessed: counts.unprocessed,
        latestReportAt: latest
          ? latest.toLocaleString("en-US", {
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
  }, [filteredClustersList]);

  const columnDefs = useMemo(
    () => [
      { headerName: "Barangay", field: "barangay", flex: 1 },
      { headerName: "Date Range", field: "dateRange", flex: 1 },
      { headerName: "Latest Report", field: "latestReportAt", flex: 1 },
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

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      filter: true,
    }),
    []
  );
  const theme = useMemo(
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

  return (
    <div
      className="ag-theme-quartz w-full rounded-2xl shadow"
      style={{ height: "68vh", overflow: "hidden" }}
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        theme={theme}
        suppressCellFocus={true}
        animateRows={true}
        pagination={true}
        paginationPageSize={10}
        context={{ openClusterDetails: onOpenDetails }}
      />
    </div>
  );
}

export default ClusterTable;
