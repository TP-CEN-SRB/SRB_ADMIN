"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
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
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import SortByFilter from "./sortBy";
import ExportCSV from "./export-csv";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
// import SortByFilter from "./sortBy";
// import ExportCSV from "./export-csv";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  count: number;
  binId: string;
  material: string;
  location: string;
}

export function DataTable<TData, TValue>({
  binId,
  count,
  columns,
  data,
  material,
  location,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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

  return (
    <div className="px-4">
      <div className="flex items-center justify-between">
        <h2 className="text-slate-800 line-clamp-1 flex-1">
          <span className="font-normal">Showing results for: </span>
          {capitalizeFirstLetter(material.toLowerCase())} bin @ {location}
        </h2>
        <div className="flex flex-wrap items-center gap-3 py-3">
          <SortByFilter
            onResetSortBy={handleResetSortBy}
            onApplySortBy={handleApplySortBy}
          />

          <ExportCSV data={data} binId={binId} />
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
      <div className="p-4 flex justify-end items-center">
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
            {"<"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= Math.ceil(count / 10)}
            onClick={handleNextClick}
          >
            {">"}
          </Button>
        </div>
      </div>
    </div>
  );
}
