import React, { useState, useMemo, useRef, useCallback } from "react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { IconPlus, IconDotsVertical } from "@tabler/icons-react";
import { AddInterventionModal, InterventionDetailsModal } from "../";

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
  return (
    <div className="flex justify-center items-center h-full w-full">
      <button
        className="p-1 rounded-full hover:bg-gray-200"
        onClick={() => p.context.openDetailsModal(p.data)}
      >
        <IconDotsVertical size={20} />
      </button>
    </div>
  );
};

// const onGridReady = (params) => {
//   const columnApi = params.columnApi;
//   const gridWidth = params.api.getGridWidth();
//   // Your operations here
// };

function InterventionsTable({
  interventions,
  isActionable = true,
  onlyRecent = false,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const gridRef = useRef(null);

  let rowData = interventions.map((intervention) => ({
    _id: intervention._id,
    barangay: intervention.barangay,
    date: new Date(intervention.date).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
    interventionType: intervention.interventionType,
    personnel: intervention.personnel,
    status: intervention.status,
  }));
  if (onlyRecent) {
    rowData = rowData.slice(0, 5); // Show only the top 5 recent reports
  }
  const columnDefs = useMemo(() => {
    const baseCols = [
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
        minWidth: 100,
        filter: false,
        cellRenderer: ActionsCell,
      });
    }

    return baseCols;
  }, [isActionable]);

  const theme = useMemo(() => customTheme, []);

  // const onGridSizeChanged = useCallback((params) => {
  //   const gridWidth = gridRef.current?.offsetWidth;
  //   const allColumns = params.columnApi.getAllColumns();
  //   const columnsToShow = [];
  //   const columnsToHide = [];
  //   let totalColsWidth = 0;

  //   if (allColumns) {
  //     allColumns.forEach((col) => {
  //       totalColsWidth += col.getMinWidth() || 100;
  //       if (totalColsWidth > gridWidth) {
  //         columnsToHide.push(col.getColId());
  //       } else {
  //         columnsToShow.push(col.getColId());
  //       }
  //     });
  //   }

  //   params.columnApi.setColumnsVisible(columnsToShow, true);
  //   params.columnApi.setColumnsVisible(columnsToHide, false);

  //   setTimeout(() => {
  //     params.api.sizeColumnsToFit();
  //   }, 10);
  // }, []);

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  const openDetailsModal = (selectedRow) => {
    const intervention = interventions.find(
      (interv) => interv._id === selectedRow._id
    );
    setSelectedIntervention(intervention); // Find full intervention data
    setIsDetailsModalOpen(true);
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedIntervention(null);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full gap-6">
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
          pagination={isActionable && !onlyRecent} // Only show pagination when not showing only recent
          paginationPageSize={10}
          // onGridSizeChanged={onGridSizeChanged}
          onFirstDataRendered={onFirstDataRendered}
          context={{ openDetailsModal }}
          // onGridReady={onGridReady}
        />
      </div>
      <div className="flex w-full justify-center">
        {isActionable && (
          <button
            onClick={openAddModal}
            className="flex gap-1 bg-primary items-center rounded-2xl py-3 px-6 text-lg text-white font-semibold hover:cursor-pointer hover:bg-primary/90 transition-all duration-200 "
          >
            <IconPlus size={17} />
            Add New Intervention
          </button>
        )}
      </div>

      {/* Intervention Details Modal */}
      {isDetailsModalOpen && selectedIntervention && (
        <InterventionDetailsModal
          intervention={selectedIntervention} // Pass full intervention object
          onClose={closeDetailsModal}
        />
      )}

      {/* Add Intervention Modal */}
      {isAddModalOpen && (
        <AddInterventionModal isOpen={isAddModalOpen} onClose={closeAddModal} />
      )}
    </div>
  );
}

export default InterventionsTable;
