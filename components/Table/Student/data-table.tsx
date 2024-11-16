"use client";
import {
  ColumnDef,
  flexRender,
  getPaginationRowModel,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
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
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  count: number;
}

export function DataTable<TData, TValue>({
  count,
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      rowSelection,
    },
  });

  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const page = parseInt(searchParams.get("page") as string);
  const router = useRouter();
  const handlePreviousClick = () => {
    if (page > Math.ceil(count / 10)) {
      router.push(`/admin/user?page=${1}`);
    } else if (!isNaN(page)) {
      router.push(`/admin/user?page=${page - 1}`);
    }
  };
  const handleNextClick = () => {
    if (!isNaN(page)) {
      router.push(`/admin/user?page=${page + 1}`);
    } else {
      router.push(`/admin/user?page=${2}`);
    }
  };
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/admin/user?page=1&query=${query}`);
    }
  };
  const handleReset = () => {
    router.push(`/admin/user?page=${page}`);
    setQuery("");
  };
  return (
    <div>
      <div className="flex items-center p-3">
        <form onSubmit={handleSearch}>
          <div className="flex items-center gap-x-3 px-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter students..."
              className="max-w-sm"
            />
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Search
            </Button>
            <Button
              type="button"
              onClick={handleReset}
              className="border border-emerald-600 bg-transparent text-emerald-700 hover:bg-emerald-50"
            >
              Reset
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 flex justify-between items-center">
        <div>
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-2">
          <p>
            Page {isNaN(page) ? "1" : page} of {Math.ceil(count / 10)}
          </p>
          <Button
            disabled={page === 1 || isNaN(page)}
            onClick={handlePreviousClick}
            variant="outline"
            size="sm"
          >
            <FaChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(count / 10)}
            onClick={handleNextClick}
          >
            <FaChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
