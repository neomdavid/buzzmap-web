import React, {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { Link, useNavigate } from "react-router-dom";

// Debounce utility to prevent excessive reflows
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
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
  const statusStyles = {
    Scheduled: "bg-info/10 text-info border-info/20",
    Ongoing: "bg-warning/10 text-warning border-warning/20",
    Complete: "bg-success/10 text-success border-success/20",
    Archived: "bg-gray-100 text-gray-500 border-gray-200",
  };

  return (
    <div className="flex items-center justify-center h-full p-1">
      <span
        className={`${statusStyles[status]} rounded-2xl px-4 py-1 flex items-center justify-center text-sm font-semibold text-center border`}
      >
        {status}
      </span>
    </div>
  );
};

const DateCell = (p) => {
  const date = p.value;
  return (
    <div className="flex items-center justify-center h-full">
      {date.toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })}
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
  refetchInterventions,
  archivesView = false,
  showControls = true,
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [isRefetching, setIsRefetching] = useState(false);
  const containerRef = useRef(null); // DOM container for AG Grid
  const gridRef = useRef(null); // AG Grid React ref (component/api)
  const navigate = useNavigate();

  // Ensure interventions is always an array to prevent errors
  const interventionsArray = interventions || [];
  const filtered = interventionsArray.filter((intervention) =>
    archivesView
      ? (intervention.status || "") === "Archived"
      : (intervention.status || "") !== "Archived"
  );
  let rowData = filtered.map((intervention) => ({
    _id: intervention._id,
    barangay: intervention.barangay,
    address: intervention.address,
    date: new Date(intervention.date), // Keep as Date object
    interventionType: intervention.interventionType,
    personnel: intervention.personnel,
    status: intervention.status,
  }));
  if (onlyRecent) {
    rowData = rowData.slice(0, 5); // Show only the top 5 recent reports
  }
  const columnDefs = useMemo(() => {
    const baseCols = [
      { field: "barangay", headerName: "Barangay", minWidth: 150 },
      {
        field: "address",
        headerName: "Address",
        minWidth: 250,
        sortable: false,
        cellRenderer: (p) => (
          <div className="flex items-center h-full p-1">
            <span className="truncate" title={p.value}>
              {p.value || "No address specified"}
            </span>
          </div>
        ),
      },
      {
        field: "date",
        headerName: "Date",
        minWidth: 140,
        cellRenderer: DateCell,
        sort: "desc", // Default sort by date descending
        comparator: (dateA, dateB) => {
          return dateA.getTime() - dateB.getTime();
        },
      },
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
        sortable: false,
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
    // Use requestAnimationFrame to prevent forced reflow
    requestAnimationFrame(() => {
      try {
        if (params?.api) {
          params.api.sizeColumnsToFit();
        }
      } catch (error) {
        console.warn("Grid initial render failed:", error);
      }
    });
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

  const handleRefetch = async () => {
    if (refetchInterventions) {
      setIsRefetching(true);
      try {
        await refetchInterventions();
      } catch (error) {
        console.error("Error refetching interventions:", error);
      } finally {
        setIsRefetching(false);
      }
    }
  };

  // Accessibility: ensure required ARIA child roles are present in the AG Grid DOM
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const applyAriaRoles = () => {
      try {
        const root = container.querySelector(".ag-root");
        if (!root) return false;
        root.setAttribute("role", "grid");
        const headerViewport = root.querySelector(".ag-header-viewport");
        if (headerViewport) {
          headerViewport.setAttribute("role", "rowgroup");
          const headerRow = root.querySelector(".ag-header-row");
          if (headerRow) headerRow.setAttribute("role", "row");
          // Header cells must be columnheader
          headerViewport
            .querySelectorAll(".ag-header-cell")
            .forEach((cell) => cell.setAttribute("role", "columnheader"));
          // Ensure header container is presentational to avoid nested rowgroup
          root
            .querySelectorAll(".ag-header-container")
            .forEach((el) => el.setAttribute("role", "presentation"));
        }
        root
          .querySelectorAll(".ag-center-cols-container .ag-row")
          .forEach((row) => row.setAttribute("role", "row"));
        root
          .querySelectorAll(".ag-center-cols-container .ag-cell")
          .forEach((cell) => cell.setAttribute("role", "gridcell"));
        const rowCount =
          root.querySelectorAll(".ag-center-cols-container .ag-row").length ||
          0;
        const colCount =
          root.querySelectorAll(".ag-header .ag-header-cell").length || 0;
        root.setAttribute("aria-rowcount", String(rowCount));
        root.setAttribute("aria-colcount", String(colCount));
        return true;
      } catch {
        return false;
      }
    };

    // Try immediately and on next frame in case grid hasn't mounted
    const immediate = applyAriaRoles();
    if (!immediate) {
      const raf = requestAnimationFrame(() => applyAriaRoles());
      // Also observe for dynamic header/body render
      const observer = new MutationObserver(() => applyAriaRoles());
      observer.observe(container, { childList: true, subtree: true });
      return () => {
        cancelAnimationFrame(raf);
        observer.disconnect();
      };
    }
  }, [rowData, columnDefs]);

  return (
    <div className="flex flex-col h-full min-h-0 gap-6">
      {isRefetching && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">
              Refreshing interventions...
            </span>
          </div>
        </div>
      )}

      {/* Empty states */}
      {rowData.length === 0 ? (
        archivesView ? (
          <div className="flex flex-col items-center justify-center flex-1 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8">
            <div className="text-center">
              <p className="mt-2 mb-2 text-2xl font-bold text-primary">
                No archived interventions found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Use View All Records to see active interventions.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8">
            <div className="text-center">
              <p className="mt-2 mb-2 text-2xl font-semibold text-gray-900">
                No interventions found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {onlyRecent
                  ? "No recent intervention records have been created yet."
                  : "No intervention records have been created yet."}
              </p>
              {isActionable && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={openAddModal}
                    className="flex gap-1 bg-primary items-center rounded-2xl py-3 px-6 text-lg text-white font-semibold hover:cursor-pointer hover:bg-primary/90 transition-all duration-200"
                  >
                    <IconPlus size={17} />
                    Add New Intervention
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      ) : (
        <>
          {/* Top-right controls (hide in condensed Recent section to avoid duplication) */}
          {showControls && !onlyRecent && (
            <div className="flex items-center justify-end mb-2 gap-2">
              {archivesView ? (
                <Link
                  to="/admin/interventions/all"
                  className="flex gap-1 items-center rounded-2xl py-2 px-4 text-sm font-semibold hover:cursor-pointer transition-all duration-200 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  View All Records
                </Link>
              ) : (
                <Link
                  to="/admin/interventions/archives"
                  className="flex gap-1 items-center rounded-2xl py-2 px-4 text-sm font-semibold hover:cursor-pointer transition-all duration-200 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                >
                  View Archives
                </Link>
              )}
            </div>
          )}

          <div
            className="ag-theme-quartz flex-1 min-h-0"
            ref={containerRef}
            style={{ height: "100%", width: "100%", minHeight: 0 }}
          >
            <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              theme={theme}
              suppressColumnVirtualisation={false}
              suppressRowVirtualisation={false}
              rowBuffer={10}
              suppressAnimationFrame={false}
              suppressPreventDefaultOnMouseWheel={true}
              pagination={isActionable && !onlyRecent}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              onFirstDataRendered={onFirstDataRendered}
              context={{ openDetailsModal }}
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
        </>
      )}

      {/* Intervention Details Modal */}
      {isDetailsModalOpen && selectedIntervention && (
        <InterventionDetailsModal
          intervention={selectedIntervention} // Pass full intervention object
          onClose={closeDetailsModal}
          onRefetch={handleRefetch}
        />
      )}

      {/* Add Intervention Modal */}
      {isAddModalOpen && (
        <AddInterventionModal
          isOpen={isAddModalOpen}
          onClose={closeAddModal}
          onRefetch={handleRefetch}
        />
      )}
    </div>
  );
}

export default InterventionsTable;
