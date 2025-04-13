"use client";

import React, { useMemo, useState, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
} from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

const myTheme = themeQuartz.withParams({
  spacing: 12,
  accentColor: "red",
});

export default const ReportTable2 = () => {
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const [rowData, setRowData] = useState(
    (() => {
      const rowData = [];
      for (let i = 0; i < 10; i++) {
        rowData.push({
          make: "Toyota",
          model: "Celica",
          price: 35000 + i * 1000,
        });
        rowData.push({
          make: "Ford",
          model: "Mondeo",
          price: 32000 + i * 1000,
        });
        rowData.push({
          make: "Porsche",
          model: "Boxster",
          price: 72000 + i * 1000,
        });
      }
      return rowData;
    })()
  );
  const [columnDefs, setColumnDefs] = useState([
    { field: "make" },
    { field: "model" },
    { field: "price" },
  ]);
  const theme = useMemo(() => {
    return myTheme;
  }, []);
  const defaultColDef = useMemo(() => {
    return {
      editable: true,
      flex: 1,
      minWidth: 100,
      filter: true,
    };
  }, []);

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          theme={theme}
          defaultColDef={defaultColDef}
        />
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <ReportTable2 />
  </StrictMode>
);
