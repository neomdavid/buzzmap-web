import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { IconSearch, IconCheck, IconX } from "@tabler/icons-react";
import { ReportDetailsModal, VerifyReportModal } from "../"; // Import the modal
import { useValidatePostMutation } from "../../api/dengueApi";

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
    status === "Validated"
      ? "bg-success"
      : status === "Pending"
      ? "bg-warning"
      : "bg-error";

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
  const { undoState, handleVerify, handleReject, handleUndo } = p.context;
  const status = p.data.status;
  const id = p.data.id;
  const isUndoing = !!undoState[id];

  const viewButton = (
    <button
      className="flex items-center gap-1 text-primary hover:bg-gray-200 p-1 rounded-md hover:cursor-pointer"
      onClick={() => p.context.openModal(p.data, "view")}
    >
      <IconSearch size={13} stroke={2.5} />
      <p className="text-sm">view</p>
    </button>
  );
  const verifyButton = (
    <button
      className="flex items-center gap-1 text-success hover:bg-gray-200 p-1 rounded-md hover:cursor-pointer"
      onClick={() => handleVerify(p.data)}
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
      onClick={() => handleReject(p.data)}
    >
      <IconX size={15} stroke={5} />
      <p className="text-sm">reject</p>
    </button>
  );
  const undoButton = (
    <button
      className="flex items-center gap-1 text-warning hover:bg-gray-200 p-1 rounded-md hover:cursor-pointer"
      onClick={() => handleUndo(p.data)}
    >
      <p className="text-sm">Undo</p>
    </button>
  );

  return (
    <div className="py-2 h-full w-full flex items-center gap-2">
      {viewButton}
      {isUndoing ? undoButton : (
        <>
          {status === "Pending" && verifyButton}
          {status === "Pending" && rejectButton}
        </>
      )}
    </div>
  );
};

// const onGridReady = (params) => {
//   // Now it's safe to access grid API methods like columnApi
//   const columnApi = params.columnApi;
//   const gridWidth = params.api.getGridWidth();
//   // Your operations here
// };

const UNDO_STORAGE_KEY = 'reportUndoState';

function loadUndoStateFromStorage() {
  try {
    const raw = localStorage.getItem(UNDO_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    // Remove expired (older than 1 hour)
    const now = Date.now();
    const valid = {};
    Object.entries(parsed).forEach(([id, info]) => {
      if (now - info.timestamp < 3600000) {
        valid[id] = info;
      }
    });
    return valid;
  } catch {
    return {};
  }
}

function saveUndoStateToStorage(state) {
  localStorage.setItem(UNDO_STORAGE_KEY, JSON.stringify(state));
}

function ReportTable2({ posts, isActionable = true, onlyRecent = false }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [validatePost] = useValidatePostMutation();
  const [undoState, setUndoState] = useState(() => loadUndoStateFromStorage()); // { [id]: { prevStatus, newStatus, timestamp } }

  const gridRef = useRef(null);

  // SAFETY CHECK: If posts is not an array, show a message and don't render the grid
  if (!Array.isArray(posts)) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load reports data.
      </div>
    );
  }

  // Format the rowData to match the structure of the grid
  let rowData = posts.map((post) => ({
    id: post._id,
    username: post.user?.username || "Anonymous", // Assuming username is part of the post
    barangay: post.barangay, // Separate row for barangay
    coordinates: post.specific_location?.coordinates || [], // Separate row for coordinates (array)
    date: new Date(post.date_and_time).toLocaleString("en-US", {
      weekday: "short", // "Mon"
      year: "numeric", // "2025"
      month: "short", // "Apr"
      day: "numeric", // "27"
      hour: "2-digit", // "11"
      minute: "2-digit", // "30"
      second: "2-digit", // "45"
      hour12: true, // Show 12-hour format with AM/PM
    }),
    status: post.status,
    description: post.description, // Include description
    images: post.images || [], // Include images, default to empty array if undefined
  }));

  // If onlyRecent is true, slice the top 5 recent reports
  if (onlyRecent) {
    rowData = rowData.slice(0, 5); // Show only the top 5 recent reports
  }

  // On mount, clean up expired undo states
  useEffect(() => {
    const valid = loadUndoStateFromStorage();
    setUndoState(valid);
    saveUndoStateToStorage(valid);
  }, []);

  // Keep localStorage in sync with undoState
  useEffect(() => {
    saveUndoStateToStorage(undoState);
  }, [undoState]);

  // Handler for verify
  const handleVerify = (row) => {
    setSelectedReport(row);
    setSelectedReportType("verify");
    setIsModalOpen(true);
  };

  // Handler for reject
  const handleReject = (row) => {
    setSelectedReport(row);
    setSelectedReportType("reject");
    setIsModalOpen(true);
  };

  // Handler to be called after confirmation in modal
  const handleConfirmAction = async (row, actionType) => {
    const timestamp = Date.now();
    const newStatus = actionType === "verify" ? "Validated" : "Rejected";
    setUndoState((prev) => ({
      ...prev,
      [row.id]: { prevStatus: row.status, newStatus, timestamp },
    }));
    await validatePost({ id: row.id, status: newStatus });
  };

  // Handler for undo
  const handleUndo = async (row) => {
    const undoInfo = undoState[row.id];
    if (!undoInfo) return;
    await validatePost({ id: row.id, status: undoInfo.prevStatus });
    setUndoState((prev) => {
      const copy = { ...prev };
      delete copy[row.id];
      return copy;
    });
  };

  const columnDefs = useMemo(() => {
    const baseCols = [
      { field: "username", headerName: "Username", minWidth: 150 },
      { field: "barangay", headerName: "Barangay", minWidth: 200 },
      { field: "date", headerName: "Date & Time", minWidth: 120 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 140,
        cellRenderer: StatusCell,
      },
    ];

    if (isActionable && !onlyRecent) {
      baseCols.push({
        field: "actions",
        headerName: "Actions",
        minWidth: 200,
        filter: false,
        cellRenderer: ActionsCell,
        cellRendererParams: {
          undoState,
          handleVerify,
          handleReject,
          handleUndo,
        },
      });
    }

    return baseCols;
  }, [isActionable, onlyRecent, undoState]);

  const theme = useMemo(() => customTheme, []);

  const onGridSizeChanged = useCallback((params) => {
    const gridWidth = gridRef.current?.offsetWidth;
    const columnsToShow = [];
    const columnsToHide = [];
    let totalColsWidth = 0;

    // if (allColumns) {
    //   allColumns.forEach((col) => {
    //     totalColsWidth += col.getMinWidth() || 100;
    //     if (totalColsWidth > gridWidth) {
    //       columnsToHide.push(col.getColId());
    //     } else {
    //       columnsToShow.push(col.getColId());
    //     }
    //   });
    // }

    // params.columnApi.setColumnsVisible(columnsToShow, true);
    // params.columnApi.setColumnsVisible(columnsToHide, false);

    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 10);
  }, []);

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const openModal = (post, type) => {
    console.log("Selected Report Data:", post); // Log the full post data to ensure everything is correct
    setSelectedReport(post);
    setSelectedReportType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedReport(null); // Clear the selected report
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
          pagination={isActionable && !onlyRecent} // Only show pagination when not showing only recent
          paginationPageSize={10}
          onGridSizeChanged={onGridSizeChanged}
          onFirstDataRendered={onFirstDataRendered}
          context={{ openModal, undoState, handleVerify, handleReject, handleUndo }}
          // onGridReady={onGridReady} // Add this line
        />
      </div>

      {/* Modal to show details */}
      {isModalOpen && selectedReport && selectedReportType === "view" && (
        <ReportDetailsModal
          reportId={selectedReport.id}
          barangay={selectedReport.barangay}
          location={`Barangay: ${selectedReport.barangay}, Coordinates: ${
            selectedReport.specific_location?.coordinates?.join(", ") ||
            "No coordinates available"
          }`}
          description={selectedReport.description}
          reportType={selectedReport.report_type}
          status={selectedReport.status}
          dateAndTime={selectedReport.date}
          images={selectedReport.images}
          onClose={closeModal}
          coordinates={selectedReport.coordinates}
          type={selectedReportType}
          username={selectedReport.username}
        />
      )}
      {isModalOpen &&
        selectedReport &&
        (selectedReportType === "reject" ||
          selectedReportType === "verify") && (
          <VerifyReportModal
            reportId={selectedReport.id}
            barangay={selectedReport.barangay}
            location={`Barangay: ${selectedReport.barangay}, Coordinates: ${
              selectedReport.specific_location?.coordinates?.join(", ") ||
              "No coordinates available"
            }`}
            description={selectedReport.description}
            reportType={selectedReport.report_type}
            status={selectedReport.status}
            dateAndTime={selectedReport.date}
            images={selectedReport.images}
            onClose={closeModal}
            coordinates={selectedReport.coordinates}
            type={selectedReportType}
            username={selectedReport.username}
            onConfirmAction={actionType => handleConfirmAction(selectedReport, actionType)}
          />
        )}
    </>
  );
}

export default ReportTable2;
