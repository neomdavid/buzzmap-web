=import React, { useState, useMemo, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import AddInterventionModal from "./AddInterventionModal"; // Import the modal
import { StatusCell } from "./StatusCell"; // Use StatusCell as before

function InterventionsTable({ posts, onlyRecent = false }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newIntervention, setNewIntervention] = useState(null);

  const addNewIntervention = (newIntervention) => {
    posts.push(newIntervention); // Add the new intervention to the posts array
    setNewIntervention(newIntervention); // Optionally, set the new intervention as state
  };

  const rowData = useMemo(() => {
    let filteredPosts = posts;

    if (onlyRecent) {
      filteredPosts = posts.slice(0, 5); // Show only the top 5 most recent interventions
    }

    return filteredPosts.map((post) => ({
      id: post.id,
      barangay: post.barangay,
      date: new Date(post.date).toLocaleString("en-US", {
        weekday: "short", // "Mon"
        year: "numeric", // "2025"
        month: "short", // "Apr"
        day: "numeric", // "27"
        hour: "2-digit", // "11"
        minute: "2-digit", // "30"
        second: "2-digit", // "45"
        hour12: true, // Show 12-hour format with AM/PM
      }),
      interventionType: post.interventionType,
      personnel: post.personnel,
      status: post.status,
    }));
  }, [posts, onlyRecent]);

  const columnDefs = useMemo(() => {
    const baseCols = [
      { field: "id", headerName: "ID", minWidth: 100 },
      { field: "barangay", headerName: "Barangay", minWidth: 200 },
      { field: "date", headerName: "Date", minWidth: 140 },
      {
        field: "interventionType",
        headerName: "Type of Intervention",
        minWidth: 200,
      },
      { field: "personnel", headerName: "Personnel", minWidth: 150 },
      {
        field: "status",
        headerName: "Status",
        minWidth: 140,
        cellRenderer: StatusCell,
      },
    ];

    return baseCols;
  }, []);

  const onGridReady = useCallback((params) => {
    const gridWidth = params.api.getGridWidth();
    // Perform operations here if needed
  }, []);

  return (
    <>
      <div>
        <button
          className="btn btn-primary mb-3"
          onClick={() => setIsModalOpen(true)} // Open the modal
        >
          Add New Intervention
        </button>
      </div>

      <div className="ag-theme-quartz" style={{ height: "100%", width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={false} // No pagination
          onGridReady={onGridReady}
        />
      </div>

      {/* Add New Intervention Modal */}
      <AddInterventionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddIntervention={addNewIntervention}
      />
    </>
  );
}

export default InterventionsTable;
