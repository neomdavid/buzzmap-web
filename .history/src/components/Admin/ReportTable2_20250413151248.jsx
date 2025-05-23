import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { data } from "../../utils";
function ReportTable2() {
  const [rowData, setRowData] = data;
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
