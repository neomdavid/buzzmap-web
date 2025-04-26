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
        <p className="text-sm">disable</p>
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
    case "disabled":
      bgColor = "bg-warning";
      textColor = "text-white";
      break;
    case "removed":
      bgColor = "bg-error";
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

  switch (value.toLowerCase()) {
    case "super admin":
      bgColor = "bg-purple-500";
      textColor = "text-white";
      break;
    case "admin":
      bgColor = "bg-blue-500";
      textColor = "text-white";
      break;
    case "moderator":
      bgColor = "bg-teal-500";
      textColor = "text-white";
      break;
    default:
      bgColor = "bg-gray-500";
      textColor = "text-white";
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

const ProfileCell = ({ value }) => {
  return (
    <div className="h-full flex items-center">
      <img
        src={value}
        alt="Profile"
        className="w-8 h-8 rounded-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "https://via.placeholder.com/32";
        }}
      />
    </div>
  );
};

const mockAdmins = [
  {
    profile: "https://randomuser.me/api/portraits/men/1.jpg",
    username: "admin1",
    email: "admin1@example.com",
    role: "Admin",
    joined: "2023-05-15",
    status: "active",
  },
  {
    profile: "https://randomuser.me/api/portraits/women/2.jpg",
    username: "admin2",
    email: "admin2@example.com",
    role: "Super Admin",
    joined: "2022-11-20",
    status: "active",
  },
  {
    profile: "https://randomuser.me/api/portraits/men/3.jpg",
    username: "admin3",
    email: "admin3@example.com",
    role: "Admin",
    joined: "2024-02-10",
    status: "disabled",
  },
  {
    profile: "https://randomuser.me/api/portraits/women/4.jpg",
    username: "admin4",
    email: "admin4@example.com",
    role: "Moderator",
    joined: "2023-08-05",
    status: "removed",
  },
  {
    profile: "https://randomuser.me/api/portraits/men/5.jpg",
    username: "admin5",
    email: "admin5@example.com",
    role: "Admin",
    joined: "2024-01-30",
    status: "active",
  },
];

function AdminsTable() {
  const [rowData] = useState(mockAdmins);
  const gridRef = useRef(null);

  const columnDefs = useMemo(
    () => [
      {
        field: "profile",
        headerName: "Photo",
        minWidth: 80,
        maxWidth: 80,
        cellRenderer: ProfileCell,
        filter: false,
        sortable: false,
      },
      { field: "username", minWidth: 120 },
      { field: "email", minWidth: 180 },
      {
        field: "role",
        minWidth: 120,
        cellRenderer: RoleCell,
      },
      {
        field: "joined",
        headerName: "Joined Date",
        minWidth: 140,
        cellRenderer: DateCell,
      },
      {
        field: "status",
        minWidth: 120,
        cellRenderer: StatusCell,
      },
      {
        field: "actions",
        minWidth: 180,
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

export default AdminsTable;
