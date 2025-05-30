import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { reports } from "../../utils";
import { useState, useMemo } from "react";
function ReportTable2() {
  const [rowData, setRowData] = reports;
  console.log(rowData);
  const [colsDef, setColsDef] = useState([
    { field: "reportId", headerName: "Report ID" },
    { field: "location" },
    { field: "date" },
    { field: "status" },
    { field: "actions" },
  ]);
  return <AgGridReact rowData={rowData} columnDefs={colsDef} />;
}

export default ReportTable2;
