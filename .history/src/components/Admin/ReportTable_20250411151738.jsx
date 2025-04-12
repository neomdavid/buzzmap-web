import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

const statusColors = {
  Verified: "bg-success",
  Pending: "bg-warning",
  Rejected: "bg-error",
};

const columnHelper = createColumnHelper();

const ReportTable = ({ rows, hasActions = false }) => {
  const baseColumns = [
    columnHelper.accessor("id", {
      header: () => "Report ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("location", {
      header: () => "Location",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("date", {
      header: () => "Date",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("status", {
      header: () => "Status",
      cell: (info) => (
        <div
          className={`${
            statusColors[info.getValue()] || "bg-base-300"
          } text-[12px] mb-1.5 text-white font-semibold rounded-full py-1 text-center w-[90px]`}
        >
          {info.getValue()}
        </div>
      ),
    }),
  ];

  const actionColumn = columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: () => (
      <div className="flex gap-2">
        <button className="btn btn-sm btn-neutral">View</button>
        <button className="btn btn-sm btn-success">Verify</button>
        <button className="btn btn-sm btn-error">Reject</button>
      </div>
    ),
  });

  const columns = hasActions ? [...baseColumns, actionColumn] : baseColumns;

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className="text-left text-[14px] text-base-content font-semibold mb-4"
          >
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="pb-4">
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="space-y-4">
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="text-black text-[13.5px] align-top">
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={`${
                  hasActions ? "bg-white" : ""
                } px-2 py-2 rounded-md`}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReportTable;
