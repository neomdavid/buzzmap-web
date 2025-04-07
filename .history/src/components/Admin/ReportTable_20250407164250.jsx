const statusColors = {
  Verified: "bg-success",
  Pending: "bg-warning",
  Rejected: "bg-error",
};

const ReportTable = () => {
  const rows = [
    {
      id: "RPT-00123",
      location: "Barangay Commonwealth",
      date: "2025-03-01",
      status: "Verified",
    },
    {
      id: "RPT-00124",
      location: "Barangay Holy Spirit",
      date: "2025-03-03",
      status: "Pending",
    },
    {
      id: "RPT-00125",
      location: "Barangay Batasan Hills",
      date: "2025-03-05",
      status: "Rejected",
    },
    {
      id: "RPT-00126",
      location: "Barangay Tandang Sora",
      date: "2025-03-06",
      status: "Verified",
    },
    {
      id: "RPT-00127",
      location: "Barangay Payatas",
      date: "2025-03-07",
      status: "Pending",
    },
  ];

  return (
    <table className="w-full">
      <thead>
        <tr className="text-left text-[14px] text-base-content font-semibold mb-4">
          <th className="pb-4">Report ID</th>
          <th className="pb-4">Location</th>
          <th className="pb-4">Date</th>
          <th className="pb-4">Status</th>
        </tr>
      </thead>
      <tbody className="space-y-4">
        {rows.map((row, index) => (
          <tr key={index} className="text-black text-[13.5px] align-top">
            <td>{row.id}</td>
            <td>{row.location}</td>
            <td>{row.date}</td>
            <td>
              <div
                className={`${
                  statusColors[row.status] || "bg-base-300"
                } text-[12px] text-white font-semibold rounded-full py-1 text-center w-[90px]`}
              >
                {row.status}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReportTable;
