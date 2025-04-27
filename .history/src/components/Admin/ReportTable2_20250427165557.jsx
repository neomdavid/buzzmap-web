function ReportTable2({ posts, isActionable = true }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const gridRef = useRef(null);

  // Format the rowData to match the structure of the grid
  const rowData = posts.map((post) => ({
    id: post._id,
    username: post.user?.username || "Anonymous",
    barangay: post.barangay,
    coordinates: post.specific_location?.coordinates || [],
    date: new Date(post.date_and_time).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }),
    status: post.status,
    description: post.description,
    images: post.images || [],
  }));

  const columnDefs = useMemo(() => {
    const baseCols = [
      { field: "id", headerName: "ID", minWidth: 100 },
      { field: "username", headerName: "Username", minWidth: 150 },
      { field: "barangay", headerName: "Barangay", minWidth: 150 },
      {
        field: "coordinates",
        headerName: "Coordinates",
        minWidth: 200,
        cellRenderer: (params) => {
          return params.value.length === 2
            ? `Lat: ${params.value[1]}, Long: ${params.value[0]}`
            : "No coordinates available";
        },
      },
      {
        field: "date",
        headerName: "Date & Time",
        minWidth: 120,
      },
      {
        field: "status",
        headerName: "Status",
        minWidth: 140,
        cellRenderer: StatusCell,
      },
    ];

    if (isActionable) {
      baseCols.push({
        field: "actions",
        headerName: "Actions",
        minWidth: 200,
        filter: false,
        cellRenderer: ActionsCell,
      });
    }

    return baseCols;
  }, [isActionable]);

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

  const openModal = (post) => {
    console.log("Selected Report Data:", post); // Log the full post data to ensure everything is correct
    setSelectedReport(post);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedReport(null); // Clear the selected report
  };

  return (
    <>
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
          pagination={true}
          paginationPageSize={10}
          onGridSizeChanged={onGridSizeChanged}
          onFirstDataRendered={onFirstDataRendered}
          context={{ openModal }} // Pass openModal through context
        />
      </div>

      {/* Modal to show details */}
      {isModalOpen && selectedReport && (
        <ReportDetailsModal
          reportId={selectedReport._id}
          barangay={selectedReport.barangay}
          location={`Barangay: ${selectedReport.barangay}, Coordinates: ${
            selectedReport.specific_location?.coordinates?.join(", ") ||
            "No coordinates available"
          }`}
          description={selectedReport.description}
          reportType={selectedReport.report_type}
          status={selectedReport.status}
          dateAndTime={selectedReport.date_and_time}
          images={selectedReport.images}
          onClose={closeModal}
        />
      )}
    </>
  );
}
