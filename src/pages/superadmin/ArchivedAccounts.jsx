import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { Link } from "react-router-dom";

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

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-warning text-white";
    case "active":
      return "bg-success text-white";
    case "disabled":
      return "bg-error text-white";
    case "banned":
      return "bg-error text-white";
    case "deleted":
      return "bg-gray-500 text-white";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

// Helper function to get display status
const getDisplayStatus = (status) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "active":
      return "Active";
    case "disabled":
      return "Disabled";
    case "banned":
      return "Banned";
    case "deleted":
      return "Archived";
    default:
      return status;
  }
};

const ArchivedAccounts = ({ 
  title = "Archived Accounts",
  data = [],
  isLoading = false,
  columns = [],
  backLink = "/superadmin/users",
  backLinkText = "Back to Active Accounts",
  emptyMessage = "No archived accounts found."
}) => {
  const [paginationPageSize, setPaginationPageSize] = useState(10);
  const [paginationPageSizeOptions] = useState([5, 10, 20, 50]);

  const rows = useMemo(
    () =>
      (data || [])
        .map((item) => ({
          ...item,
          displayStatus: getDisplayStatus(item.status),
          statusColor: getStatusColor(item.status),
          createdAt: item.createdAt
            ? new Date(item.createdAt).toLocaleString()
            : "N/A",
          deletedAt: item.deletedAt
            ? new Date(item.deletedAt).toLocaleString()
            : "N/A",
        })),
    [data]
  );

  const statusColumn = {
    headerName: "Status",
    field: "displayStatus",
    flex: 1,
    filter: 'agSetColumnFilter',
    cellRenderer: (params) => (
      <div className="h-full flex justify-center items-center">
        <span className={`px-3.5 py-1 capitalize rounded-full text-sm font-medium ${params.data.statusColor}`}>
          {params.value}
        </span>
      </div>
    ),
  };

  const allColumns = useMemo(() => {
    // Find the index where we want to insert the status column (after email)
    const emailIndex = columns.findIndex(col => col.field === "email");
    const newColumns = [...columns];
    if (emailIndex !== -1) {
      newColumns.splice(emailIndex + 1, 0, statusColumn);
    } else {
      newColumns.push(statusColumn);
    }
    return newColumns;
  }, [columns]);

  return (
    <div className="flex flex-col h-[500px] py-6">
      <div className="flex justify-between items-center mb-6">
        <p className="text-2xl font-bold text-5xl font-extrabold mb-12 md:mb-0 text-center md:justify-start md:text-left md:w-[48%] ">{title}</p>
        <Link 
          to={backLink}
          className="btn btn-outline rounded-full"
        >
          {backLinkText}
        </Link>
      </div>
      {isLoading ? (
        <p>Loading...</p>
      ) : rows.length === 0 ? (
        <div className="h-[500px] flex items-center justify-center text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="ag-theme-quartz h-[500px] w-full">
          <AgGridReact
            rowData={rows}
            columnDefs={allColumns}
            suppressRowClickSelection
            suppressCellFocus
            theme={customTheme}
            domLayout="normal"
            pagination={true}
            paginationPageSize={paginationPageSize}
            paginationPageSizeSelector={paginationPageSizeOptions}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
            style={{
              height: '100%',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ArchivedAccounts; 