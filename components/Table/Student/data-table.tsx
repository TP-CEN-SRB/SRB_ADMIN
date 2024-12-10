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
import { useDebouncedCallback } from "use-debounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import TableFilter from "./filter";
import InputFilter from "./input-filter";
import SortByFilter from "./sortBy";
import ExportCSV from "./export-csv";

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
  const path = usePathname();
  const page = Number(searchParams.get("page")) || 1;
  const router = useRouter();

  const handlePreviousClick = () => {
    const params = new URLSearchParams(searchParams);
    if (page > Math.ceil(count / 10)) {
      params.set("page", "1");
    } else if (!isNaN(page)) {
      params.set("page", `${page - 1}`);
    }
    router.push(`${path}?${params.toString()}`);
  };

  const handleNextClick = () => {
    const params = new URLSearchParams(searchParams);
    if (!isNaN(page)) {
      params.set("page", `${page + 1}`);
    } else {
      params.set("page", "2");
    }
    router.push(`${path}?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((query: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (query) {
      params.set("query", encodeURIComponent(query));
    } else {
      params.delete("query");
    }
    router.replace(`${path}?${params.toString()}`);
  }, 300);

  const handleApplySortBy = (sortItem: string, sortOrder: string) => {
    const params = new URLSearchParams(searchParams);
    if (sortItem && sortOrder) {
      params.set("sortItem", `${sortItem}`);
      params.set("sortOrder", `${sortOrder}`);
    } else {
      params.delete("sortItem");
      params.delete("sortOrder");
    }
    router.replace(`${path}?${params.toString()}`);
  };

  const handleResetSortBy = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("sortItem");
    params.delete("sortOrder");
    router.replace(`${path}?${params.toString()}`);
  };

  const handleApplyFilter = (filters: Record<string, string[]>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(filters).forEach(([key, value]) => {
      if (value.length > 0) {
        params.set(key, `${value.join(",")}`);
      } else {
        params.delete(key);
      }
    });
    router.replace(`${path}?${params.toString()}`);
  };

  const handleResetFilter = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("emailType");
    params.delete("faculty");
    router.replace(`${path}?${params.toString()}`);
  };

  return (
    <div className="px-4">
      <div className="flex flex-wrap justify-end items-center gap-3 py-3">
        <InputFilter
          query={searchParams.get("query")}
          onSearch={handleSearch}
        />
        <div className="flex gap-3">
          <SortByFilter
            onResetSortBy={handleResetSortBy}
            onApplySortBy={handleApplySortBy}
          />
          <TableFilter
            onApplyFilter={handleApplyFilter}
            onResetFilter={handleResetFilter}
          />
          <ExportCSV data={data} />
        </div>
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
            Page {isNaN(page) ? "1" : page} of{" "}
            {Math.max(Math.ceil(count / 10), 1)}
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
