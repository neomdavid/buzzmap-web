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
          } text-[12px] mb-1.5 text-white font-semibold rounded-full py-1 text-center w-[90px] mb-[-1px]`}
        >
          {info.getValue()}
        </div>
      ),
      // Custom sorting logic: "Verified" should come first
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
        <div className="flex gap-4 w-full justify-around text-primary text-[12px] border-l-[1.6px] border-gray-200 pl-2 ml-[-4px]">
          <button className="flex gap-1 p-1 rounded-md hover:bg-gray-100 hover:cursor-pointer ">
            <IconSearch size={13} stroke={2.5} />
            <p className="mt-[-1px]">view</p>
          </button>

          {!isVerified && (
            <>
              <button className="flex items-center text-success gap-1 p-1 rounded-md hover:bg-gray-100 hover:cursor-pointer">
                <div className="rounded-full bg-success p-0.5">
                  <IconCheck size={12} color="white" stroke={4} />
                </div>
                <p>verify</p>
              </button>
              <button className="flex items-center text-error gap-1 p-1 rounded-md hover:bg-gray-100 hover:cursor-pointer">
                <IconX size={15} stroke={5} />
                <p>reject</p>
              </button>
            </>
          )}
        </div>
      );
    },
  });

  const columns = hasActions ? [...baseColumns, actionColumn] : baseColumns;

  const table = useReactTable({
    data: rows,
    columns,
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
          <tr key={row.id} className="text-black text-[13.5px] align-center">
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={`${
                  hasActions ? "bg-white py-3" : "p-2"
                } px-2 rounded-md`}
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
