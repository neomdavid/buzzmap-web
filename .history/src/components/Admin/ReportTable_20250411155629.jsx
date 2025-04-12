import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { IconSearch, IconCheck, IconX } from "@tabler/icons-react";

const statusColors = {
  Verified: "bg-success",
  Pending: "bg-warning",
  Rejected: "bg-error",
};

const columnHelper = createColumnHelper();

const ReportTable = ({ rows, hasActions = false }) => {
  const [statusFilter, setStatusFilter] = useState("");

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
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true; // Show all if no filter
        return row.getValue(columnId) === filterValue;
      },
      sortingFn: (a, b) => {
        const aStatus = a.getValue();
        const bStatus = b.getValue();
        if (aStatus === "Verified" && bStatus !== "Verified") return -1;
        if (aStatus !== "Verified" && bStatus === "Verified") return 1;
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
        <div className="flex gap-4 text-primary text-[12px] border-l-[1.6px] border-gray-200 pl-2 ml-[-4px]">
          <button className="flex items-center gap-1 p-1 rounded-md hover:bg-gray-100 hover:cursor-pointer ">
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
    state: {
      columnFilters: statusFilter
        ? [{ id: "status", value: statusFilter }]
        : [],
    },
    onColumnFiltersChange: (updater) => {
      const newFilters =
        typeof updater === "function"
          ? updater(table.getState().columnFilters)
          : updater;
      const status = newFilters.find((f) => f.id === "status")?.value || "";
      setStatusFilter(status);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      {/* Filter UI */}
      <div className="mb-4">
        <label htmlFor="status-filter" className="mr-2">
          Filter by Status:
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            table.setColumnFilters(
              e.target.value ? [{ id: "status", value: e.target.value }] : []
            );
          }}
          className="border p-2 rounded-md"
        >
          <option value="">All</option>
          <option value="Verified">Verified</option>
          <option value="Pending">Pending</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

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
    </div>
  );
};

export default ReportTable;
