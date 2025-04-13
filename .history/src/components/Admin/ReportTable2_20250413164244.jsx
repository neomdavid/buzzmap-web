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
    <div className="py-2 h-full bg-primary w-200 flex items-center gap-2">
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
