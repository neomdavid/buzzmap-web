import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { useSelector } from "react-redux";
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

const Archives = ({ 
  title = "Archived Posts",
  data = [],
  isLoading = false,
  columns = [],
  backLink = "/admin/cea",
  backLinkText = "Back to Active Posts",
  emptyMessage = "No archived posts found."
}) => {
  const [paginationPageSize, setPaginationPageSize] = useState(10);
  const [paginationPageSizeOptions] = useState([5, 10, 20, 50]);

  const rows = useMemo(
    () =>
      (data || [])
        .filter(item => item.status === "archived")
        .map((item) => ({
          ...item,
          publishDate: item.publishDate
            ? new Date(item.publishDate).toLocaleString()
            : "N/A",
        })),
    [data]
  );

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex justify-between items-center mb-4">
        <p className="text-2xl font-bold">{title}</p>
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
            columnDefs={columns}
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

export default Archives; 