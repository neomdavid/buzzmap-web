import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getSortedRowModel,
} from "@tanstack/react-table";
import { IconSearch, IconCheck, IconX } from "@tabler/icons-react";

const statusColors = {
  Verified: "bg-success",
  Pending: "bg-warning",
  Rejected: "bg-error",
};

const columnHelper = createColumnHelper();

const ReportTable = ({ rows, columns }) => {
  const baseColumns = [
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
        <div className="flex justify-center">
          <div
            className={`${
              statusColors[info.getValue()] || "bg-base-300"
            } text-[12px] text-white font-semibold rounded-full py-1 text-center w-[90px]`}
          >
            {info.getValue()}
          </div>
        </div>
      ),

      sortingFn: (a, b) => {
        if (a === "Verified" && b !== "Verified") return -1;
        if (a !== "Verified" && b === "Verified") return 1;
        return 0;
      },
    }),
  ];

  const actionColumn = columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const status = row.original.status;
      const isVerified = status === "Verified";

      return (
        <div
          className={`flex w-full text-primary text-[12px] border-l-[1.6px] border-gray-200 pl-2 ml-[-4px] lg:px-5
            ${isVerified ? "justify-start gap-2" : "justify-between gap-2"}`}
        >
          <button
            className={`flex flex-1 ${
              isVerified ? " justify-center" : "justify-center"
            } items-center gap-1 p-1 rounded-md hover:bg-gray-100 hover:cursor-pointer`}
          >
            <IconSearch size={13} stroke={2.5} />
            <p className="mt-[-1px]">view</p>
          </button>

          {!isVerified && (
            <>
              <button className="flex flex-1 justify-center items-center text-success gap-1 p-1 rounded-md hover:bg-gray-100 hover:cursor-pointer">
                <div className="rounded-full bg-success p-0.5">
                  <IconCheck size={12} color="white" stroke={4} />
                </div>
                <p>verify</p>
              </button>
              <button className="flex flex-1 justify-center items-center text-error gap-1 p-1 rounded-md hover:bg-gray-100 hover:cursor-pointer">
                <IconX size={15} stroke={5} />
                <p>reject</p>
              </button>
            </>
          )}
        </div>
      );
    },
  });

  const columnsToUse = columns || [...baseColumns, actionColumn];

  const table = useReactTable({
    data: rows,
    columns: columnsToUse,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table className="w-full table-auto border-separate border-spacing-y-2">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className="text-left text-[14px] text-base-content font-semibold mb-4"
          >
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className={`pb-4 ${
                  ["actions", "date", "status"].includes(header.column.id)
                    ? "text-center"
                    : "text-left"
                }`}
              >
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
          <tr key={row.id} className="text-black text-[13.5px] align-center">
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={`${
                  ["date", "status"].includes(cell.column.id)
                    ? "text-center"
                    : ""
                }`}
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
