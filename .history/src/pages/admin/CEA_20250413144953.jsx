import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";

import { useState, useMemo } from "react";
ModuleRegistry.registerModules([AllCommunityModule]);

const MyCellComponent = (p) => {
  return (
    <>
      <button onClick={() => window.alert("Action!")}>+</button>
      {p.value}
    </>
  );
};

const myTheme = themeQuartz.withParams({
  spacing: 12,
  accentColor: "var(--color-primary)",
  fontFamily: ["Inter"],
  fontSize: 11,
});

const CEA = () => {
  const defaultColDef = useMemo(() => {
    return {
      flex: 1,
      filter: true,
      // floatingFilter: true,
      // editable: true,
    };
  });
  const [rowData, setRowData] = useState([
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    { make: "Chevrolet", model: "Bolt EV", price: 36995, electric: true },
    { make: "BMW", model: "i3", price: 44450, electric: true },
    { make: "Hyundai", model: "Kona Electric", price: 37995, electric: true },
    { make: "Nissan", model: "Leaf", price: 31290, electric: true },
    { make: "Audi", model: "e-tron", price: 65900, electric: true },
    { make: "Volkswagen", model: "ID.4", price: 39995, electric: true },
    { make: "Ford", model: "Mustang Mach-E", price: 42995, electric: true },
    { make: "Porsche", model: "Taycan", price: 79900, electric: true },
    { make: "Mercedes-Benz", model: "EQC", price: 67500, electric: true },
    { make: "Jaguar", model: "I-Pace", price: 69900, electric: true },
    { make: "Kia", model: "Niro EV", price: 39990, electric: true },
    { make: "Honda", model: "Clarity EV", price: 33900, electric: true },
    { make: "Mini", model: "Cooper SE", price: 29900, electric: true },
    { make: "Lucid", model: "Air", price: 76900, electric: true },
    { make: "Rivian", model: "R1T", price: 73900, electric: true },
    { make: "Toyota", model: "Camry", price: 24970, electric: false },
    { make: "Chevrolet", model: "Impala", price: 31500, electric: false },
    { make: "Honda", model: "Accord", price: 26500, electric: false },
    { make: "BMW", model: "3 Series", price: 41300, electric: false },
    { make: "Hyundai", model: "Sonata", price: 25400, electric: false },
    { make: "Audi", model: "A4", price: 39900, electric: false },
    { make: "Ford", model: "Explorer", price: 33900, electric: false },
    { make: "Nissan", model: "Altima", price: 25910, electric: false },
    { make: "Volkswagen", model: "Passat", price: 26995, electric: false },
    { make: "Mazda", model: "CX-5", price: 27090, electric: false },
    { make: "Subaru", model: "Outback", price: 26870, electric: false },
    { make: "Jeep", model: "Grand Cherokee", price: 36900, electric: false },
    { make: "Chrysler", model: "Pacifica", price: 34890, electric: false },
  ]);

  const theme = useMemo(() => {
    return myTheme;
  }, []);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs, setColDefs] = useState([
    {
      // valueGetter: (p) => p.data.make + " " + p.data.price,
      field: "make",
      // cellRenderer: MyCellComponent,
      // cellEditor: "agSelectCellEditor",
      // cellEditorParams: { values: ["Tesla", "Ford", "Toyota"] },
      // checkboxSelection: true,
    },
    { field: "model" },
    {
      field: "price",
      valueFormatter: (p) => "Php " + p.value.toLocaleString(),
    },
    { field: "electric" },
  ]);
  return (
    <main className="flex flex-col w-full ">
      <p className="flex justify-center bg-red-100 text-5xl font-extrabold mb-4  text-center md:justify-start md:text-left md:w-[48%] lg:w-[60%] ">
        Community Engagement and Awareness
      </p>
      <div className="flex">
        <div className="ag-theme-quartz w-full" style={{ height: 500 }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            rowSelection={"multiple"}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20]}
            theme={theme}
            // defaultColDef={defaultColDef}
          />
        </div>
      </div>
    </main>
  );
};

export default CEA;
