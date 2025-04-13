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
    <div className="p-2">
      <div className="bg-error">{p.value}</div>
    </div>
  );
};

function ReportTable2() {
  const [rowData, setRowData] = useState(reports);

  const [colsDef, setColsDef] = useState([
    { field: "id", headerName: "Report ID" }, // fix from "reportId" to "id"
    { field: "location" },
    { field: "date" },
    { field: "status", cellRenderer: StatusCell },
    { field: "actions" },
  ]);

  return (
    <div className="ag-theme-quartz" style={{ height: 500, width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colsDef}
        defaultColDef={defaultColDef}
      />
    </div>
  );
}

export default ReportTable2;
