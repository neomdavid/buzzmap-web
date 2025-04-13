import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { reports } from "../../utils";
import { useState, useMemo } from "react";

ModuleRegistry.registerModules([AllCommunityModule]);

const defaultColDef = {
  flex: 1,
  minWidth: 100,
};

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
        className={`${bgColor} rounded-full w-full h-full flex items-center justify-center text-white text-sm text-center`}
      >
        {status}
      </span>
    </div>
  );
};

const customTheme = themeQuartz.withParams({
  accentColor: "rgb(59,130,246)",
});

function ReportTable2() {
  const [rowData, setRowData] = useState(reports);

  const [colsDef, setColsDef] = useState([
    { field: "id", headerName: "Report ID" },
    { field: "location" },
    { field: "date" },
    { field: "status", cellRenderer: StatusCell },
    { field: "actions" },
  ]);

  const theme = useMemo(() => customTheme, []);

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
