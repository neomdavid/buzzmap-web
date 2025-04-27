import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { IconSearch, IconCheck, IconX } from "@tabler/icons-react";
import ReportDetailsModal from "./ReportDetailsModal"; // Import the modal

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
    status === "Verified"
      ? "bg-success"
      : status === "Pending"
      ? "bg-warning"
      : "bg-error";

  return (
    <div className="flex items-center justify-start h-full p-1">
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
      onClick={() => p.context.openModal(p.data)} // Using context to access openModal
    >
      <IconSearch size={13} stroke={2.5} />
      <p className="text-sm">view</p>
    </button>
  );
  const verifyButton = (
    <button className="flex items-center gap-1 text-success hover:bg-gray-200 p-1 rounded-md hover:cursor-pointer">
      <div className="rounded-full bg-success p-0.5">
        <IconCheck size={11} color="white" stroke={4} />
      </div>
      <p className="text-sm">verify</p>
    </button>
  );
  const rejectButton = (
    <button className="flex items-center gap-1 text-error hover:bg-gray-200 p-1 rounded-md hover:cursor-pointer">
      <IconX size={15} stroke={5} />
      <p className="text-sm">reject</p>
    </button>
  );

  return (
    <div className="py-2 h-full w-full flex items-center gap-2">
      {viewButton}
      {status === "Pending" && verifyButton}
      {status === "Pending" && rejectButton}
    </div>
  );
};

function ReportTable2({ posts, isActionable = true }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const gridRef = useRef(null);

  // Format the rowData to match the structure of the grid
  const rowData = posts.map((post) => ({
    id: post._id,
    username: post.user?.username || "Anonymous", // Assuming username is part of the post
    barangay: post.barangay,
    location: `Barangay: ${
      post.barangay
    }, Coordinates: ${post.specific_location.coordinates.join(", ")}`,
    // Format the date to be more user-friendly
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
  }));

  const columnDefs = useMemo(() => {
    const baseCols = [
      { field: "id", headerName: "ID", minWidth: 100 },
      { field: "username", headerName: "Username", minWidth: 150 },
      { field: "location", headerName: "Location", minWidth: 200 },
      { field: "date", headerName: "Date & Time", minWidth: 120 },
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

  const openModal = (post) => {
    setSelectedReport(post); // Store the selected post's data
    setIsModalOpen(true); // Open the modal
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
          pagination={true}
          paginationPageSize={10}
          onGridSizeChanged={onGridSizeChanged}
          onFirstDataRendered={onFirstDataRendered}
          context={{ openModal }} // Pass openModal through context
        />
      </div>

      {/* Modal to show details */}
      {isModalOpen && selectedReport && (
        <ReportDetailsModal
          reportId={selectedReport._id}
          barangay={selectedReport.barangay}
          location={`Barangay: ${
            selectedReport.barangay
          }, Coordinates: ${selectedReport.specific_location.coordinates.join(
            ", "
          )}`}
          description={selectedReport.description}
          reportType={selectedReport.report_type}
          status={selectedReport.status}
          dateAndTime={selectedReport.date_and_time}
          images={selectedReport.images}
          onClose={closeModal}
        />
      )}
    </>
  );
}

export default ReportTable2;
