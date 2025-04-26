import React, { useState, useMemo, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

// Example icons and helper components (use your actual imports here)
import { IconSearch, IconBan, IconTrash } from "@tabler/icons-react"; // Assuming you have these icons installed

// Mock user data for demonstration
const mockUsers = [
  {
    id: 1,
    username: "john_doe",
    email: "john.doe@example.com",
    role: "admin",
    profilePicture: "https://i.pravatar.cc/150?img=1", // Image URL or default avatar
    joined: "2023-01-15",
    lastPosted: "2023-04-01",
    status: "Verified",
  },
  {
    id: 2,
    username: "jane_smith",
    email: "jane.smith@example.com",
    role: "admin",
    profilePicture: "https://i.pravatar.cc/150?img=2", // Image URL or default avatar
    joined: "2022-09-10",
    lastPosted: "2023-03-25",
    status: "Pending",
  },
  {
    id: 3,
    username: "alice_williams",
    email: "alice.williams@example.com",
    role: "admin",
    profilePicture: "", // Empty profile picture will use the default avatar
    joined: "2023-03-01",
    lastPosted: "2023-04-10",
    status: "Verified",
  },
  // Add more users as needed
];

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

const ProfilePictureCell = ({ value }) => {
  // This assumes the value is the image URL or avatar path
  return (
    <div className="flex justify-center items-center">
      <img
        src={value || "https://i.pravatar.cc/150?img=0"} // Default avatar if no picture is provided
        alt="Profile"
        className="w-10 h-10 rounded-full object-cover"
      />
    </div>
  );
};

const RoleCell = ({ value }) => {
  return <span>{value}</span>;
};

const DateCell = ({ value }) => {
  const date = new Date(value);
  return <span>{date.toLocaleDateString()}</span>;
};

const StatusCell = ({ value }) => {
  return <span>{value}</span>;
};

function AdminsTable() {
  const [rowData] = useState(mockUsers.filter((user) => user.role === "admin")); // Filter only admins
  const gridRef = useRef(null);

  const columnDefs = useMemo(
    () => [
      {
        field: "profilePicture",
        headerName: "Profile Picture",
        minWidth: 100,
        cellRenderer: ProfilePictureCell,
        filter: false,
      },
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
        cellRenderer: ActionsCell, // Updated actions
      },
    ],
    []
  );

  const theme = useMemo(() => "ag-theme-alpine", []);

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
      className="ag-theme-alpine"
      ref={gridRef}
      style={{ height: "100%", width: "100%" }}
    >
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
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
