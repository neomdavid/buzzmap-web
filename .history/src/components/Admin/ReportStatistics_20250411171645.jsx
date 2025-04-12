import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

const columnHelper = createColumnHelper();

const ReportStatistics = ({ data }) => {
  const [statusFilter, setStatusFilter] = useState("");

  const filteredData = statusFilter
    ? data.filter((row) => row[statusFilter] > 0)
    : data;

  const columns = [
    columnHelper.accessor("barangay", {
      header: "Barangay",
      cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
    }),
    columnHelper.accessor("Verified", {
      header: () => <span className="text-green-600">Verified</span>,
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    columnHelper.accessor("Pending", {
      header: () => <span className="text-yellow-500">Pending</span>,
      cell: (info) => <span>{info.getValue()}</span>,
    }),
    columnHelper.accessor("Rejected", {
      header: () => <span className="text-red-500">Rejected</span>,
      cell: (info) => <span>{info.getValue()}</span>,
    }),
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-5 rounded-lg bg-base-100 shadow-md max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-primary">Report Statistics</h2>
          <p className="text-sm text-gray-500">
            Dengue Reports by Barangay in Quezon City
          </p>
        </div>
        <select
          className="select select-sm bg-base-200"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="Verified">Verified</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <table className="table table-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:border border-black transition-all"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-right">
        <button className="btn btn-sm btn-primary">View more</button>
      </div>
    </div>
  );
};

export default ReportStatistics;
