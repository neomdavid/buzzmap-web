import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { IconSearch, IconCheck, IconX } from "@tabler/icons-react";
import { ReportDetailsModal, VerifyReportModal } from "../"; // Import the modal

ModuleRegistry.registerModules([AllCommunityModule]);

const defaultColDef = {
  flex: 1,
  minWidth: 100,
  filter: true,
};

const customTheme = themeQuartz.withParams({
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
});

const StatusCell = (p) => {
  const status = p.value;
  const bgColor =
    status === "Complete"
      ? "bg-success"
      : status === "Scheduled"
      ? "bg-warning"
      : "bg-info";

  return (
    <div className="flex items-center justify-center h-full p-1">
      <span
        className={`${bgColor} rounded-2xl px-4 py-1 flex items-center justify-center text-white text-sm font-semibold text-center`}
      >
        {status}
      </span>
    </div>
  );
};

const ActionsCell = (p) => {
  const status = p.data.status;

  const viewButton = (
    <button
      className="flex items-center gap-1 text-primary hover:bg-gray-200 p-1 rounded-md hover:cursor-pointer"
      onClick={() => p.context.openModal(p.data, "view")} // Using context to access openModal
    >
      <IconSearch size={13} stroke={2.5} />
      <p className="text-sm">view</p>
    </button>
  );

  const verifyButton = (
    <button
      className="flex items-center gap-1 text-success hover:bg-gray-200 p-1 rounded-md hover:cursor-pointer"
      onClick={() => p.context.openModal(p.data, "verify")} // Using context to access openModal
    >
      <div className="rounded-full bg-success p-0.5">
        <IconCheck size={11} color="white" stroke={4} />
      </div>
      <p className="text-sm">verify</p>
    </button>
  );

  const rejectButton = (
    <button
      className="flex items-center gap-1 text-error hover:bg-gray-200 p-1 rounded-md hover:cursor-pointer"
      onClick={() => p.context.openModal(p.data, "reject")} // Using context to access openModal
    >
      <IconX size={15} stroke={5} />
      <p className="text-sm">reject</p>
    </button>
  );

  return (
    <div className="py-2 h-full w-full flex items-center gap-2">
      {viewButton}
      {status === "Scheduled" && verifyButton}
      {status === "Scheduled" && rejectButton}
    </div>
  );
};

const onGridReady = (params) => {
  const columnApi = params.columnApi;
  const gridWidth = params.api.getGridWidth();
  // Your operations here
};

function InterventionsTable({ posts, isActionable = true }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState(null);

  const gridRef = useRef(null);

  const rowData = posts.map((post) => ({
    id: post.id,
    barangay: post.barangay,
    date: new Date(post.date).toLocaleString("en-US", {
      weekday: "short", // "Mon"
      year: "numeric", // "2025"
      month: "short", // "Apr"
      day: "numeric", // "27"
      hour: "2-digit", // "11"
      minute: "2-digit", // "30"
      second: "2-digit", // "45"
      hour12: true, // Show 12-hour format with AM/PM
    }),
    interventionType: post.interventionType,
    personnel: post.personnel,
    status: post.status,
  }));

  const columnDefs = useMemo(() => {
    const baseCols = [
      { field: "id", headerName: "ID", minWidth: 100 },
      { field: "barangay", headerName: "Barangay", minWidth: 200 },
      { field: "date", headerName: "Date", minWidth: 140 },
      {
        field: "interventionType",
        headerName: "Type of Intervention",
        minWidth: 200,
      },
      { field: "personnel", headerName: "Personnel", minWidth: 150 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 140,
        cellRenderer: StatusCell,
      },
    ];

    if (isActionable) {
      baseCols.push({
        field: "actions",
        headerName: "Actions",
        minWidth: 200,
        filter: false,
        cellRenderer: ActionsCell,
      });
    }

    return baseCols;
  }, [isActionable]);

  const theme = useMemo(() => customTheme, []);

  const onGridSizeChanged = useCallback((params) => {
    const gridWidth = gridRef.current?.offsetWidth;
    const allColumns = params.columnApi.getAllColumns();
    const columnsToShow = [];
    const columnsToHide = [];
    let totalColsWidth = 0;

    if (allColumns) {
      allColumns.forEach((col) => {
        totalColsWidth += col.getMinWidth() || 100;
        if (totalColsWidth > gridWidth) {
          columnsToHide.push(col.getColId());
        } else {
          columnsToShow.push(col.getColId());
        }
      });
    }

    params.columnApi.setColumnsVisible(columnsToShow, true);
    params.columnApi.setColumnsVisible(columnsToHide, false);

    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 10);
  }, []);

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const openModal = (post, type) => {
    console.log("Selected Report Data:", post);
    setSelectedReport(post);
    setSelectedReportType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  return (
    <>
      <div
        className="ag-theme-quartz"
        ref={gridRef}
        style={{ height: "100%", width: "100%" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          theme={theme}
          pagination={isActionable}
          paginationPageSize={10}
          onGridSizeChanged={onGridSizeChanged}
          onFirstDataRendered={onFirstDataRendered}
          context={{ openModal }}
          onGridReady={onGridReady}
        />
      </div>

      {/* Modal to show details */}
      {isModalOpen && selectedReport && selectedReportType === "view" && (
        <ReportDetailsModal
          reportId={selectedReport.id}
          barangay={selectedReport.barangay}
          interventionType={selectedReport.interventionType}
          personnel={selectedReport.personnel}
          status={selectedReport.status}
          date={selectedReport.date}
          onClose={closeModal}
        />
      )}
      {isModalOpen &&
        selectedReport &&
        (selectedReportType === "reject" ||
          selectedReportType === "verify") && (
          <VerifyReportModal
            reportId={selectedReport.id}
            barangay={selectedReport.barangay}
            interventionType={selectedReport.interventionType}
            personnel={selectedReport.personnel}
            status={selectedReport.status}
            date={selectedReport.date}
            onClose={closeModal}
          />
        )}
    </>
  );
}

export default InterventionsTable;
