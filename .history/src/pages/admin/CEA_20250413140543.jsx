import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import { useState } from "react";
ModuleRegistry.registerModules([AllCommunityModule]);

const CEA = () => {
  const [rowData, setRowData] = useState([
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
  ]);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState([
    { field: "make" },
    { field: "model" },
    { field: "price" },
    { field: "electric" },
  ]);
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center bg-red-100 text-5xl font-extrabold mb-4  text-center md:justify-start md:text-left md:w-[48%] lg:w-[60%] ">
        Community Engagement and Awareness
      </p>
      <div className="flex">
        <div style={{ height: 500 }}>
          <AgGridReact rowData={rowData} columnDefs={colDefs} />
        </div>
      </div>
    </main>
  );
};

export default CEA;
