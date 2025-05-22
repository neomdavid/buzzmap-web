import React, { useMemo, useState, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { useGetAllAlertsQuery } from "../../api/dengueApi";

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

const AlertsTable = () => {
  const { data: alerts, isLoading } = useGetAllAlertsQuery();
  const [selectedAlert, setSelectedAlert] = useState(null);
  const detailsDialogRef = useRef(null);
  const [paginationPageSize, setPaginationPageSize] = useState(10);
  const [paginationPageSizeOptions] = useState([5, 10, 20, 50]);

  const columns = useMemo(
    () => [
      {
        headerName: "Barangays",
        field: "barangays",
        flex: 1,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: "Severity",
        field: "severity",
        flex: 1,
        filter: 'agSetColumnFilter',
        filterParams: {
          values: ['Low', 'Medium', 'High']
        }
      },
      {
        headerName: "Messages",
        field: "messages",
        flex: 2,
        filter: 'agTextColumnFilter',
      },
      {
        headerName: "Date",
        field: "date",
        flex: 1,
        filter: 'agDateColumnFilter',
      },
      {
        headerName: "Actions",
        field: "actions",
        cellRenderer: (params) => (
          <div className="flex w-full h-full items-center justify-center  gap-2">
            <button
              onClick={() => {
                setSelectedAlert(params.data);
                detailsDialogRef.current?.showModal();
              }}
              className="btn btn-md text-white rounded-full px-6 btn-primary"
            >
              View Details
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const rows = useMemo(
    () =>
      (alerts?.data || []).map((alert) => ({
        ...alert,
        barangays: (alert.barangays || [])
          .map((b) => (typeof b === "string" ? b : b.name))
          .join(", "),
        messages: Array.isArray(alert.messages) ? alert.messages.join(" | ") : "",
        date: alert.timestamp ? new Date(alert.timestamp).toLocaleString() : "N/A",
      })),
    [alerts]
  );

  return (
    <div className="flex flex-col h-[500px]">
      <p className="text-2xl font-bold mb-4">Recent Alerts</p>
      {isLoading ? (
        <p>Loading...</p>
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

      {/* Details Dialog */}
      <dialog ref={detailsDialogRef} className="modal">
        <div className="modal-box bg-white rounded-3xl shadow-3xl w-9/12 max-w-5xl p-12 relative">
          <button
            className="absolute top-10 right-10 text-2xl font-semibold hover:text-gray-500"
            onClick={() => {
              detailsDialogRef.current?.close();
              setSelectedAlert(null);
            }}
          >
            ✕
          </button>

          {selectedAlert && (
            <div className="space-y-6">
              <p className="text-3xl font-extrabold mb-4">Alert Details</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-primary text-lg font-bold mb-1">
                    Severity
                  </label>
                  <div className="p-3 bg-base-200 rounded-lg">
                    {selectedAlert.severity}
                  </div>
                </div>

                <div className="form-control">
                  <label className="label text-primary text-lg font-bold mb-1">
                    Date
                  </label>
                  <div className="p-3 bg-base-200 rounded-lg">
                    {selectedAlert.date}
                  </div>
                </div>

                <div className="form-control col-span-2">
                  <label className="label text-primary text-lg font-bold mb-1">
                    Barangays
                  </label>
                  <div className="p-3 bg-base-200 rounded-lg">
                    {selectedAlert.barangays}
                  </div>
                </div>

                <div className="form-control col-span-2">
                  <label className="label text-primary text-lg font-bold mb-1">
                    Messages
                  </label>
                  <div className="p-3 bg-base-200 rounded-lg whitespace-pre-wrap">
                    {Array.isArray(selectedAlert.messages)
                      ? selectedAlert.messages.join('\n')
                      : selectedAlert.messages}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default AlertsTable;