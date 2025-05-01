import React, { useState, useMemo, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { IconSearch, IconCheck, IconX } from "@tabler/icons-react";
import { ReportDetailsModal, VerifyReportModal } from "../";

const defaultColDef = {
  flex: 1,
  minWidth: 100,
  filter: true,
};

const StatusCell = (p) => {
  const status = p.value;
  const bgColor =
    status === "Complete"
      ? "bg-success"
      : status === "Scheduled"
      ? "bg-warning"
      : status === "Ongoing"
      ? "bg-info"
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
  const status = p.data.status;

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
      onClick={() => p.context.openModal(p.data, "verify")}
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
      onClick={() => p.context.openModal(p.data, "reject")}
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

function InterventionsTable({ posts }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState(null);

  const gridRef = useRef(null);

  const rowData = posts.map((post) => ({
    id: post._id,
    location: post.location,
    date: new Date(post.date).toLocaleString(),
    interventionType: post.interventionType,
    personnel: post.personnel,
    status: post.status,
  }));

  const columnDefs = useMemo(() => {
    const baseCols = [
      { field: "id", headerName: "ID", minWidth: 100 },
      { field: "location", headerName: "Location", minWidth: 200 },
      { field: "date", headerName: "Date", minWidth: 140 },
      {
        field: "interventionType",
        headerName: "Type of Intervention",
        minWidth: 200,
      },
      { field: "personnel", headerName: "Personnel", minWidth: 200 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 140,
        cellRenderer: StatusCell,
      },
    ];

    return baseCols;
  }, []);

  const openModal = (post, type) => {
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
        className="ag-theme-alpine"
        ref={gridRef}
        style={{ height: "100%", width: "100%" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={10}
          context={{ openModal }}
        />
      </div>

      {/* Modal to show details */}
      {isModalOpen && selectedReport && selectedReportType === "view" && (
        <ReportDetailsModal
          reportId={selectedReport.id}
          location={selectedReport.location}
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
