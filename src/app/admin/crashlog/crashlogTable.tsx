"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  flexRender,
  PaginationState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";

interface Crashlog {
  id: string;
  message: string;
  createdAt: string;
}

interface CrashlogTableProps {
  data: Crashlog[];
}

const CrashlogTable = ({ data }: CrashlogTableProps) => {
  const columns: ColumnDef<Crashlog>[] = [
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => (
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-red-500 w-4 h-4 mt-1" />
          <span className="whitespace-pre-wrap break-words">{row.original.message}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => format(new Date(row.original.createdAt), "yyyy-MM-dd HH:mm:ss"),
    },
  ];

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: { pagination },
  });

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold">Crash Logs</h1>
      </div>

      <div className="rounded-xl border bg-white shadow">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-6 text-center text-muted-foreground"
                >
                  💤 No crash logs received yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4 mt-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm">Rows per page</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue placeholder="Page size" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {"<"}
          </Button>
          <span className="text-sm px-2">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {">"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CrashlogTable;
