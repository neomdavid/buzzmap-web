// AdminsTable.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const AdminsTable = () => {
  const gridRef = useRef(null);
  const [rowData, setRowData] = useState([]);
  const [columnDefs] = useState([
    { field: "id", headerName: "ID" },
    { field: "name", headerName: "Name" },
    { field: "role", headerName: "Role" },
  ]);

  const onGridReady = useCallback((params) => {
    gridRef.current = params.api;

    // Fetch your data here
    setRowData([
      { id: 1, name: "Alice", role: "Admin" },
      { id: 2, name: "Bob", role: "Moderator" },
      { id: 3, name: "Charlie", role: "Editor" },
    ]);

    // Safe call to getAllColumns
    const allColumns = params.columnApi.getAllColumns();
    console.log("All columns:", allColumns);
  }, []);

  const logAllColumns = () => {
    if (gridRef.current && gridRef.current.getColumnDefs) {
      const columns = gridRef.current.getColumnDefs();
      console.log("Columns:", columns);
    } else {
      console.warn("Grid is not ready yet.");
    }
  };

  return (
    <div className="ag-theme-alpine" style={{ height: 400, width: "100%" }}>
      <button onClick={logAllColumns} style={{ marginBottom: 10 }}>
        Log All Columns
      </button>
      <AgGridReact
        ref={gridRef}
        rowData={rowData}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        domLayout="autoHeight"
      />
    </div>
  );
};

export default AdminsTable;
