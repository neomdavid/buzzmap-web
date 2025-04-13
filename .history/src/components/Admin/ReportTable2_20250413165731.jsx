import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { reports } from "../../utils";
import { useState, useMemo } from "react";
import { IconSearch, IconCheck, IconX } from "@tabler/icons-react";

ModuleRegistry.registerModules([AllCommunityModule]);

let gridApi;

const gridOptions = {
  columnDefs: [
    { field: "id", minWidth: 70, maxWidth: 90 },
    { field: "location", minWidth: 120 },
    { field: "date", minWidth: 100 },
    { field: "status", minWidth: 70, maxWidth: 90 },
    { field: "actions", minWidth: 120, maxWidth: 150 },
  ],
  onGridSizeChanged: onGridSizeChanged,
  onFirstDataRendered: onFirstDataRendered,
};

function onGridSizeChanged(params) {
  // get the current grids width
  const gridWidth = document.querySelector(".ag-body-viewport").clientWidth;

  // keep track of which columns to hide/show
  const columnsToShow = [];
  const columnsToHide = [];

  // iterate over all columns (visible or not) and work out
  // now many columns can fit (based on their minWidth)
  let totalColsWidth = 0;
  const allColumns = params.api.getColumns();
  if (allColumns && allColumns.length > 0) {
    for (let i = 0; i < allColumns.length; i++) {
      const column = allColumns[i];
      totalColsWidth += column.getMinWidth();
      if (totalColsWidth > gridWidth) {
        columnsToHide.push(column.getColId());
      } else {
        columnsToShow.push(column.getColId());
      }
    }
  }

  // show/hide columns based on current grid width
  params.api.setColumnsVisible(columnsToShow, true);
  params.api.setColumnsVisible(columnsToHide, false);

  // wait until columns stopped moving and fill out
  // any available space to ensure there are no gaps
  window.setTimeout(() => {
    params.api.sizeColumnsToFit();
  }, 10);
}

function onFirstDataRendered(params) {
  params.api.sizeColumnsToFit();
}

// setup the grid after the page has finished loading
document.addEventListener("DOMContentLoaded", function () {
  const gridDiv = document.querySelector("#myGrid");
  gridApi = agGrid.createGrid(gridDiv, gridOptions);

  fetch("https://www.ag-grid.com/example-assets/olympic-winners.json")
    .then((response) => response.json())
    .then((data) => gridApi.setGridOption("rowData", data));
});

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
    <button className="flex items-center gap-1 text-primary hover:bg-gray-200 p-1 rounded-md hover:cursor-pointer">
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

      <p className="text-sm">verify</p>
    </button>
  );

  return (
    <div className=" py-2 h-full w-full  flex  items-center gap-2">
      {viewButton}
      {status === "Pending" && verifyButton}
      {status === "Pending" && rejectButton}
    </div>
  );
};

function ReportTable2() {
  const [rowData, setRowData] = useState(reports);

  const [colsDef, setColsDef] = useState([
    { field: "id", headerName: "ID", flex: 0.5 },
    { field: "location", flex: 1.5 },
    { field: "date", flex: 0.5 },
    { field: "status", flex: 0.5, cellRenderer: StatusCell },
    { field: "actions", flex: 1.5, filter: false, cellRenderer: ActionsCell },
  ]);

  const theme = useMemo(() => {
    return customTheme;
  }, []);

  return (
    <div className="ag-theme-quartz" style={{ height: "100%", width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colsDef}
        defaultColDef={defaultColDef}
        theme={theme}
        pagination={true}
        paginationPageSizeSelector={[10, 20]}
      />
    </div>
  );
}

export default ReportTable2;
