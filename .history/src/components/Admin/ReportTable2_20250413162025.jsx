import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { reports } from "../../utils";
import { useState, useMemo } from "react";

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

  spacing: 10,
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
    <button className="btn btn-sm btn-outline btn-info">View</button>
  );
  const verifyButton = (
    <button className="btn btn-sm btn-outline btn-success">Verify</button>
  );
  const rejectButton = (
    <button className="btn btn-sm btn-outline btn-error">Reject</button>
  );

  return (
    <div className="flex flex-wrap gap-2">
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
    { field: "date" },
    { field: "status", cellRenderer: StatusCell },
    { field: "actions", filter: false, cellRenderer: ActionsCell },
  ]);

  const theme = useMemo(() => {
    return customTheme;
  }, []);

  return (
    <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colsDef}
        defaultColDef={defaultColDef}
        theme={theme}
      />
    </div>
  );
}

export default ReportTable2;
