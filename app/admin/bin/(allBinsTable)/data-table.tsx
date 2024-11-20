"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  PaginationState,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaPlusCircle } from "react-icons/fa";

import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

type Checked = DropdownMenuCheckboxItemProps["checked"];

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const handleFilterChange = (status: string, checked: boolean) => {
    // Update individual state for each status
    const newFunctionalState =
      status === "FUNCTIONAL" ? checked : showFunctional;
    const newUnderMaintenanceState =
      status === "UNDER_MAINTENANCE" ? checked : showUnderMaintenance;

    // Set local states to update the checkbox UI immediately
    setShowFunctional(newFunctionalState);
    setShowUnderMaintenance(newUnderMaintenanceState);

    // Determine filter behavior based on selected states
    if (newFunctionalState && newUnderMaintenanceState) {
      // Both statuses checked, clear the filter to show all rows
      table.getColumn("status")?.setFilterValue(undefined);
    } else if (newFunctionalState) {
      // Only "Functional" checked, filter for "FUNCTIONAL" rows
      table.getColumn("status")?.setFilterValue("FUNCTIONAL");
    } else if (newUnderMaintenanceState) {
      // Only "Under Maintenance" checked, filter for "UNDER_MAINTENANCE" rows
      table.getColumn("status")?.setFilterValue("UNDER_MAINTENANCE");
    } else {
      // No statuses checked, clear the filter to show all rows
      table.getColumn("status")?.setFilterValue(undefined);
    }
  };
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      pagination,
      columnFilters,
    },
  });
  const [showFunctional, setShowFunctional] = useState<Checked>(false);
  const [showUnderMaintenance, setShowUnderMaintenance] =
    useState<Checked>(false);
  const [filterValue, setFilterValue] = useState(
    (table.getColumn("location")?.getFilterValue() as string) ?? ""
  );

  const handleClear = () => {
    setFilterValue(""); // Clear the input
    table.getColumn("location")?.setFilterValue(""); // Reset the table filter
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterValue(value); // Update the input state
    table.getColumn("location")?.setFilterValue(value); // Update the table filter
  };
  return (
    <>
      <div className="px-4">
        <div className="flex items-center py-4 space-x-2">
          <div className="relative max-w-sm">
            <Input
              placeholder="Filter Location..."
              value={filterValue}
              onChange={handleInputChange}
              className="pr-8" // Add padding to avoid overlap with the button
            />
            {filterValue && (
              <button
                onClick={handleClear}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>
          {/* <AllBinsTableStatusDropdown/> */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FaPlusCircle />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Statuses</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showFunctional}
                onCheckedChange={(checked) =>
                  handleFilterChange("FUNCTIONAL", checked)
                }
                onSelect={(e) => e.preventDefault()}
              >
                Functional
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={showUnderMaintenance}
                onCheckedChange={(checked) =>
                  handleFilterChange("UNDER_MAINTENANCE", checked)
                }
                onSelect={(e) => e.preventDefault()}
              >
                Under Maintenance
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        <div className="flex items-center justify-end space-x-8 py-4">
          <div className="flex items-center space-x-2">
            <span className="whitespace-nowrap">Rows per page</span>
            <Select
              value={String(table.getState().pagination.pageSize)}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select page size" />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={String(pageSize)}>
                    <span className="pr-4">{pageSize}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <div>Page</div>
            <span>
              {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount().toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-end space-x-2">
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
    </>
  );
}
