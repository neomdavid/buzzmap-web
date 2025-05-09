import {
  FormPublicPost,
  FormDengueAlert,
  FormCoordinationRequest,
} from "../../components";
import { useGetAllAdminPostsQuery, useGetAllAlertsQuery } from "../../api/dengueApi";
import { useSelector } from "react-redux";
import ReportTable from "../../components/Admin/ReportTable";
import { AgGridReact } from "ag-grid-react";
import { themeQuartz } from "ag-grid-community";
import { useMemo } from "react";

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

const CEA = () => {
  const token = useSelector((state) => state.auth.token);

  // Pass token in headers for adminPosts (if your baseQuery doesn't do this automatically)
  const { data: adminPosts, isLoading: loadingPosts } = useGetAllAdminPostsQuery(undefined, {
    skip: !token,
  });
  const { data: alerts, isLoading: loadingAlerts } = useGetAllAlertsQuery();
  console.log("alerts", alerts, "loadingAlerts", loadingAlerts);
  const theme = useMemo(() => customTheme, []);

  // Prepare rows for Admin Posts Table
  const adminPostRows = (adminPosts || []).slice(0, 5).map(post => ({
    title: post.title,
    category: post.category,
    publishDate: post.publishDate ? new Date(post.publishDate).toLocaleString() : "N/A",
    images: post.images,
  }));

  // Prepare rows for Alerts Table
  const alertColumns = [
    { headerName: "Barangays", field: "barangays", flex: 1 },
    { headerName: "Severity", field: "severity", flex: 1 },
    { headerName: "Messages", field: "messages", flex: 2 },
    { headerName: "Date", field: "date", flex: 1 },
  ];

  const alertRows = (alerts?.data || []).slice(0, 5).map(alert => ({
    barangays: (alert.barangays || []).map(b => typeof b === "string" ? b : b.name).join(", "),
    severity: alert.severity || "N/A",
    messages: (alert.messages || []).join(" | "),
    date: alert.timestamp ? new Date(alert.timestamp).toLocaleString() : "N/A",
  }));

  // Custom columns for Admin Posts
  const adminPostColumns = [
    { headerName: "Title", field: "title", flex: 1 },
    { headerName: "Category", field: "category", flex: 1 },
    { headerName: "Publish Date", field: "publishDate", flex: 1 },
    {
      headerName: "Images",
      field: "images",
      flex: 1,
      cellRenderer: params =>
        params.value && params.value.length > 0
          ? params.value.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="post"
                style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, marginRight: 4 }}
              />
            ))
          : "No images"
    }
  ];

  return (
    <main className="flex flex-col w-full overflow-x-hidden">
      <p className="flex justify-center text-5xl font-extrabold mb-10 text-center md:justify-start md:text-left md:w-[48%] ">
        Community Engagement and Awareness
      </p>

      <section className="flex flex-col">
        {/* First Row - Two Forms */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start mb-8">
          <FormPublicPost />
          <FormDengueAlert />
        </div>
        <div>
          <FormCoordinationRequest />
        </div>
      </section>

      {/* Admin Posts Table */}
      <div className="mt-12">
        <p className="text-2xl font-bold mb-4">Recent Admin Posts</p>
        {loadingPosts ? (
          <p>Loading...</p>
        ) : (
          <div className="ag-theme-alpine" style={{ width: "100%", height: 300 }}>
            <AgGridReact
              rowData={adminPostRows}
              columnDefs={adminPostColumns}
              suppressRowClickSelection
              suppressCellFocus
              theme={theme}
              domLayout="normal"
            />
          </div>
        )}
      </div>

      {/* Alerts Table */}
      <div className="mt-12">
        <p className="text-2xl font-bold mb-4">Recent Alerts</p>
        {loadingAlerts ? (
          <p>Loading...</p>
        ) : (
          <div className="ag-theme-alpine" style={{ width: "100%", height: 300 }}>
            <AgGridReact
              rowData={alertRows}
              columnDefs={alertColumns}
              suppressRowClickSelection
              suppressCellFocus
              theme={theme}
              domLayout="normal"
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default CEA;
