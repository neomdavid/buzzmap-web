import React from "react";

const ReportStatistics = () => {
  const data = [
    { barangay: "Holy Spirit", verified: 1, pending: 4, rejected: 2 },
    { barangay: "Payatas", verified: 3, pending: 3, rejected: 3 },
    { barangay: "Batasan Hills", verified: 4, pending: 5, rejected: 4 },
    { barangay: "Commonwealth", verified: 2, pending: 6, rejected: 4 },
    { barangay: "Fairview", verified: 1, pending: 1, rejected: 3 },
  ];

  return (
    <div
      className="report-container"
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ color: "#333", textAlign: "center" }}>Report Statistics</h1>
      <h2 style={{ color: "#555", marginBottom: "20px" }}>
        Dengue Reports by Barangay in Quezon City
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f2f2f2" }}>
            <th
              style={{
                padding: "12px",
                textAlign: "left",
                borderBottom: "1px solid #ddd",
              }}
            >
              Barangay
            </th>
            <th
              style={{
                padding: "12px",
                textAlign: "left",
                borderBottom: "1px solid #ddd",
              }}
            >
              Verified
            </th>
            <th
              style={{
                padding: "12px",
                textAlign: "left",
                borderBottom: "1px solid #ddd",
              }}
            >
              Pending
            </th>
            <th
              style={{
                padding: "12px",
                textAlign: "left",
                borderBottom: "1px solid #ddd",
              }}
            >
              Rejected
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
              <td style={{ padding: "12px" }}>{row.barangay}</td>
              <td style={{ padding: "12px" }}>{row.verified}</td>
              <td style={{ padding: "12px" }}>{row.pending}</td>
              <td style={{ padding: "12px" }}>{row.rejected}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <a href="#" style={{ color: "#0066cc", textDecoration: "none" }}>
          View more
        </a>
      </div>
    </div>
  );
};

export default ReportStatistics;
