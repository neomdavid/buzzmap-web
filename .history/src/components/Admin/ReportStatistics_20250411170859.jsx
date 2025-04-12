import React from "react";
import { IconSettings } from "@tabler/icons-react";

const data = [
  { barangay: "Holy Spirit", verified: 1, pending: 4, rejected: 2 },
  { barangay: "Payatas", verified: 3, pending: 3, rejected: 3 },
  { barangay: "Batasan Hills", verified: 4, pending: 5, rejected: 4 },
  { barangay: "Commonwealth", verified: 2, pending: 6, rejected: 4 },
  { barangay: "Fairview", verified: 1, pending: 1, rejected: 3 },
];

const ReportStatistics = () => {
  return (
    <div className="bg-[#f6fbfd] rounded-xl p-6 shadow-sm w-full max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-[#417ba7]">
            Report Statistics
          </h2>
          <p className="text-sm text-[#48b5bd]">
            Dengue Reports by Barangay in Quezon City
          </p>
        </div>
        <IconSettings size={20} className="text-[#8cb7ca]" />
      </div>

      {/* Table */}
      <table className="w-full table-fixed text-[15px] text-gray-800">
        <thead>
          <tr className="text-left border-b border-gray-300">
            <th className="w-[35%] pb-2 font-semibold text-[#417ba7]">
              Barangay
            </th>
            <th className="w-[20%] pb-2 font-semibold text-green-600 text-center">
              Verified
            </th>
            <th className="w-[20%] pb-2 font-semibold text-yellow-500 text-center">
              Pending
            </th>
            <th className="w-[20%] pb-2 font-semibold text-red-500 text-center">
              Rejected
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.barangay} className="hover:bg-white">
              <td className="py-2">{item.barangay}</td>
              <td className="text-center">{item.verified}</td>
              <td className="text-center">{item.pending}</td>
              <td className="text-center">{item.rejected}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Button */}
      <div className="mt-5 flex justify-end">
        <button className="bg-[#2b6b78] text-white text-sm px-4 py-1.5 rounded-full hover:bg-[#24565f] transition">
          View more
        </button>
      </div>
    </div>
  );
};

export default ReportStatistics;
