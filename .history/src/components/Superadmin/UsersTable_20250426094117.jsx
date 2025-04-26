import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useState, useMemo, useRef, useCallback, useEffect } from "react";
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

const DateCell = ({ value }) => {
  const date = new Date(value);
  const formatted = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return <span>{formatted}</span>;
};

const StatusCell = ({ value }) => {
  let bgColor = "";
  let textColor = "";

  switch (value) {
    case "active":
      bgColor = "bg-success";
      textColor = "text-white";
      break;
    case "unverified":
      bgColor = "bg-warning";
      textColor = "text-white";
      break;
    case "banned":
      bgColor = "bg-error";
      textColor = "text-white";
      break;
    case "removed":
      bgColor = "bg-red-400";
      textColor = "text-white";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-600";
  }

  return (
    <div className="h-full flex justify-center items-center">
      <span
        className={`px-3.5 py-1 capitalize rounded-full text-sm font-medium ${bgColor} ${textColor}`}
      >
        {value}
      </span>
    </div>
  );
};
const RoleCell = ({ value }) => {
  let bgColor = "";
  let textColor = "";

  switch (value) {
    case "admin":
      bgColor = "bg-blue-500";
      textColor = "text-white";
      break;
    case "moderator":
      bgColor = "bg-teal-500";
      textColor = "text-white";
      break;
    case "user":
      bgColor = "bg-gray-500";
      textColor = "text-white";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-600";
  }

  return (
    <div className="h-full flex justify-center items-center">
      <span
        className={`px-3.5 py-1 capitalize rounded-full text-sm font-medium ${bgColor} ${textColor}`}
      >
        {value}
      </span>
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
    username: "sarahk",
    email: "sarah.k@example.com",
    role: "user",
    joined: "2023-11-12",
    lastPosted: "2025-04-10",
    status: "unverified",
  },
  {
    username: "mike_t",
    email: "mike.t@example.com",
    role: "user",
    joined: "2024-02-18",
    lastPosted: "2025-04-22",
    status: "active",
  },
  {
    username: "emily_w",
    email: "emily.w@example.com",
    role: "user",
    joined: "2024-03-30",
    lastPosted: "2025-03-28",
    status: "banned",
  },
  {
    username: "david_b",
    email: "david.b@example.com",
    role: "user",
    joined: "2023-12-10",
    lastPosted: "2025-04-20",
    status: "active",
  },
  {
    username: "lisa_t",
    email: "lisa.t@example.com",
    role: "user",
    joined: "2024-01-15",
    lastPosted: "2025-04-05",
    status: "unverified",
  },
  {
    username: "robert_g",
    email: "robert.g@example.com",
    role: "user",
    joined: "2024-01-22",
    lastPosted: "2025-02-14",
    status: "removed",
  },
  {
    username: "jen_lee",
    email: "jen.lee@example.com",
    role: "user",
    joined: "2023-09-08",
    lastPosted: "2025-04-18",
    status: "active",
  },
  {
    username: "kevin_m",
    email: "kevin.m@example.com",
    role: "user",
    joined: "2024-04-01",
    lastPosted: "2025-04-24",
    status: "active",
  },
  {
    username: "amanda_w",
    email: "amanda.w@example.com",
    role: "user",
    joined: "2023-07-19",
    lastPosted: "2025-03-10",
    status: "banned",
  },
  {
    username: "steve_h",
    email: "steve.h@example.com",
    role: "user",
    joined: "2023-05-30",
    lastPosted: "2025-04-12",
    status: "active",
  },
  {
    username: "michelle_c",
    email: "michelle.c@example.com",
    role: "user",
    joined: "2024-02-28",
    lastPosted: "2025-04-23",
    status: "active",
  },
  {
    username: "ryan_m",
    email: "ryan.m@example.com",
    role: "user",
    joined: "2023-11-11",
    lastPosted: "2025-04-19",
    status: "unverified",
  },
  {
    username: "natalie_k",
    email: "natalie.k@example.com",
    role: "user",
    joined: "2023-06-25",
    lastPosted: "2025-01-15",
    status: "removed",
  },
  {
    username: "peter_w",
    email: "peter.w@example.com",
    role: "user",
    joined: "2024-03-05",
    lastPosted: "2025-04-21",
    status: "active",
  },
  {
    username: "olivia_m",
    email: "olivia.m@example.com",
    role: "user",
    joined: "2023-04-17",
    lastPosted: "2025-04-08",
    status: "active",
  },
  {
    username: "daniel_s",
    email: "daniel.s@example.com",
    role: "user",
    joined: "2024-01-30",
    lastPosted: "2025-03-30",
    status: "banned",
  },
  {
    username: "hannah_g",
    email: "hannah.g@example.com",
    role: "user",
    joined: "2023-10-05",
    lastPosted: "2025-04-17",
    status: "active",
  },
  {
    username: "alex_h",
    email: "alex.h@example.com",
    role: "user",
    joined: "2023-12-20",
    lastPosted: "2025-04-14",
    status: "unverified",
  },
  {
    username: "sophia_l",
    email: "sophia.l@example.com",
    role: "user",
    joined: "2024-01-10",
    lastPosted: "2025-04-16",
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
      { field: "role", minWidth: 100, cellRenderer: RoleCell },
      {
        field: "joined",
        headerName: "Joined Date",
        minWidth: 140,
        cellRenderer: DateCell,
      },
      {
        field: "lastPosted",
        headerName: "Last Posted",
        minWidth: 140,
        cellRenderer: DateCell,
      },
      {
        field: "status",
        headerName: "Verification",
        minWidth: 140,
        cellRenderer: StatusCell,
      },
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

  const showPagination = rowData.length > 10;

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
        pagination={showPagination}
        paginationPageSize={10}
        rowHeight={60}
        paginationPageSizeSelector={showPagination ? [5, 10, 20] : undefined}
        onGridSizeChanged={onGridSizeChanged}
        onFirstDataRendered={onFirstDataRendered}
      />
    </div>
  );
}

export default UsersTable;
