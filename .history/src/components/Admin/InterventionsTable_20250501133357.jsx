import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { IconSearch, IconCheck, IconX, IconPlus } from "@tabler/icons-react";
import { AddInterventionModal } from "../"; // Import the modal

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

const onGridReady = (params) => {
  const columnApi = params.columnApi;
  const gridWidth = params.api.getGridWidth();
  // Your operations here
};

function InterventionsTable({ posts, isActionable = true }) {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const gridRef = useRef(null);

  const rowData = posts.map((post) => ({
    id: post.id,
    barangay: post.barangay,
    date: new Date(post.date).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
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

  const openModal = (intervention, type) => {
    if (type === "view") {
      setSelectedIntervention(intervention);
      setIsViewModalOpen(true);
    } else if (type === "add") {
      setIsAddModalOpen(true);
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedIntervention(null);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Interventions</h2>
        {isActionable && (
          <button
            onClick={() => openModal(null, "add")}
            className="btn btn-primary flex items-center gap-2"
          >
            <IconPlus size={18} />
            Add Intervention
          </button>
        )}
      </div>

      <div
        className="ag-theme-quartz flex-grow"
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

      {/* View Intervention Modal */}
      {isViewModalOpen && selectedIntervention && (
        <dialog
          open
          className="modal modal-bottom sm:modal-middle"
          onClick={(e) => e.target === e.currentTarget && closeViewModal()}
        >
          <div className="modal-box bg-white rounded-3xl shadow-2xl w-11/12 max-w-4xl p-8">
            <button
              className="absolute top-6 right-6 text-2xl font-semibold hover:text-gray-500"
              onClick={closeViewModal}
            >
              ✕
            </button>

            <h3 className="text-2xl font-bold mb-6 text-center">
              Intervention Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500">ID</p>
                  <p className="font-semibold">{selectedIntervention.id}</p>
                </div>
                <div>
                  <p className="text-gray-500">Barangay</p>
                  <p className="font-semibold">
                    {selectedIntervention.barangay}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-semibold">{selectedIntervention.date}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-500">Type of Intervention</p>
                  <p className="font-semibold">
                    {selectedIntervention.interventionType}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Personnel</p>
                  <p className="font-semibold">
                    {selectedIntervention.personnel}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <div className="mt-1">
                    <StatusCell
                      value={{ value: selectedIntervention.status }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn" onClick={closeViewModal}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Add Intervention Modal */}
      {isAddModalOpen && (
        <AddInterventionModal isOpen={isAddModalOpen} onClose={closeAddModal} />
      )}
    </div>
  );
}

export default InterventionsTable;
