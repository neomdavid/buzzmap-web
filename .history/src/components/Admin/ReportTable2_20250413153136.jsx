import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { reports } from "../../utils";
import { useState, useMemo } from "react";

ModuleRegistry.registerModules([AllCommunityModule]);

const defaultColDef = {
  flex: 1,
};

const StatusCell = (p) => {
  return (
    <div className="px-4 py-1">
      <div className="bg-error rounded-full text-center  text-white">
        {p.value}
      </div>
    </div>
  );
};

const myTheme = themeQuartz.withParams({
  spacing: 12,
  accentColor: "red",
});
function ReportTable2() {
  const [rowData, setRowData] = useState(reports);

  const [colsDef, setColsDef] = useState([
    { field: "id", headerName: "Report ID" }, // fix from "reportId" to "id"
    { field: "location" },
    { field: "date" },
    { field: "status", cellRenderer: StatusCell },
    { field: "actions" },
  ]);

  const theme = useMemo(() => {
    return customTheme;
  });

  return (
    <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colsDef}
        defaultColDef={defaultColDef}
        rowHeight={50} // Adjust row height for spacing
      />
    </div>
  );
}

export default ReportTable2;
