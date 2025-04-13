import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { data } from "../../utils";
function ReportTable2() {
  const [rowData, setRowData] = data;
  const [colsDef, setColsDef] = useState([
    { field: "make" },
    { field: "make" },
    { field: "make" },
  ]);
  return <></>;
}

export default ReportTable2;
