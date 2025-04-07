const statusColors = {
  Verified: "bg-success",
  Pending: "bg-warning",
  Rejected: "bg-error",
};

const ReportTable = ({ rows }) => {
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
