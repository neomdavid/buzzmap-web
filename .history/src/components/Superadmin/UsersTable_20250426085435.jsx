import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState, useMemo, useRef, useCallback } from "react";
import { IconSearch, IconBan, IconTrash } from "@tabler/icons-react";

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

const ActionsCell = (p) => {
  return (
    <div className="py-2 h-full w-full flex items-center gap-2">
      <button className="flex items-center gap-1 text-primary hover:bg-gray-200 p-1 rounded-md">
        <IconSearch size={13} stroke={2.5} />
        <p className="text-sm">view</p>
      </button>
      <button className="flex items-center gap-1 text-warning hover:bg-gray-200 p-1 rounded-md">
        <IconBan size={15} stroke={2} />
        <p className="text-sm">ban</p>
      </button>
      <button className="flex items-center gap-1 text-error hover:bg-gray-200 p-1 rounded-md">
        <IconTrash size={15} stroke={2.5} />
        <p className="text-sm">remove</p>
      </button>
    </div>
  );
};

const mockUsers = [
  {
    username: "johndoe",
    email: "john@example.com",
    role: "user",
    joined: "2024-01-05",
    lastPosted: "2025-04-25",
    status: "active",
  },
  {
    username: "adminuser",
    email: "admin@example.com",
    role: "admin",
    joined: "2023-10-12",
    lastPosted: "2025-04-10",
    status: "active",
  },
];

function UsersTable() {
  const [rowData] = useState(mockUsers);
  const gridRef = useRef(null);

  const columnDefs = useMemo(
    () => [
      { field: "username", minWidth: 120 },
      { field: "email", minWidth: 180 },
      { field: "role", minWidth: 100 },
      { field: "joined", headerName: "Joined Date", minWidth: 140 },
      { field: "lastPosted", headerName: "Last Posted", minWidth: 140 },
      {
        field: "actions",
        minWidth: 200,
        filter: false,
        cellRenderer: ActionsCell,
      },
    ],
    []
  );

  const theme = useMemo(() => customTheme, []);

  const onGridSizeChanged = useCallback((params) => {
    const gridWidth = gridRef.current?.offsetWidth;
    const allColumns = params.columnApi.getAllColumns();
    const columnsToShow = [];
    const columnsToHide = [];
    let totalColsWidth = 0;

    if (allColumns) {
      allColumns.forEach((col) => {
        totalColsWidth += col.getMinWidth() || 100;
        if (totalColsWidth > gridWidth) {
          columnsToHide.push(col.getColId());
        } else {
          columnsToShow.push(col.getColId());
        }
      });
    }

    params.columnApi.setColumnsVisible(columnsToShow, true);
    params.columnApi.setColumnsVisible(columnsToHide, false);

    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 10);
  }, []);

  const onFirstDataRendered = useCallback((params) => {
    params.api.sizeColumnsToFit();
  }, []);

  return (
    <div
      className="ag-theme-quartz"
      ref={gridRef}
      style={{ height: "100%", width: "100%" }}
    >
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        theme={theme}
        pagination={true}
        paginationPageSizeSelector={[10, 20]}
        onGridSizeChanged={onGridSizeChanged}
        onFirstDataRendered={onFirstDataRendered}
      />
    </div>
  );
}

export default UsersTable;
