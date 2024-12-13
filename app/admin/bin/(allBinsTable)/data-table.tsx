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
import ExportCSV from "./export-csv";
import { TbSettingsCheck, TbSettingsX } from "react-icons/tb";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  materials: { name: string; id: string }[];
}

type Checked = DropdownMenuCheckboxItemProps["checked"];

export function DataTable<TData, TValue>({
  columns,
  data,
  materials,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
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
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [locationFilterValue, setLocationFilterValue] = useState(
    (table.getColumn("location")?.getFilterValue() as string) ?? ""
  );
  const [selectedMaterial, setSelectedMaterial] = useState<string[]>([]);

  const handleMaterialFilterChange = (checked: boolean, material: string) => {
    //update the selected material array based on the checked material state
    //if state is checked, use spread operator to add the material to the array with the prev values
    //if state is unchecked, use filter to remove the material from the array
    const updatedMaterials = checked
      ? [...selectedMaterial, material]
      : selectedMaterial.filter((item) => item !== material);
    setSelectedMaterial(updatedMaterials);
    //apply the filter to the table
    table
      .getColumn("material")
      ?.setFilterValue(updatedMaterials.length ? updatedMaterials : undefined);
  };

  //update the location filter value and apply the filter to the table
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocationFilterValue(value); // Update the input state
    table.getColumn("location")?.setFilterValue(value); // Update the table filter
  };

  const handleFilterChange = (checked: boolean, status: string) => {
    setStatusFilter((prevFilter) => {
      let newFilter;
      if (checked) {
        if (!prevFilter) {
          newFilter = status;
        } else if (
          (prevFilter === "FUNCTIONAL" && status === "UNDER_MAINTENANCE") ||
          (prevFilter === "UNDER_MAINTENANCE" && status === "FUNCTIONAL")
        ) {
          newFilter = undefined;
        } else {
          newFilter = prevFilter;
        }
      } else {
        newFilter = prevFilter === status ? undefined : prevFilter;
      }
      table.getColumn("status")?.setFilterValue(newFilter);
      return newFilter;
    });
  };

  return (
    <>
      <div className="px-4">
        <div className="flex justify-end items-center py-3 space-x-2">
          <div className="relative max-w-sm">
            <Input
              type="search"
              placeholder="Filter Location..."
              value={locationFilterValue}
              onChange={handleInputChange}
              className="pr-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="bg-emerald-600 hover:bg-emerald-700 rounded-lg p-2 text-gray-50 flex items-center gap-x-2 text-sm">
              <FaPlusCircle />
              Filter
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" side="bottom" align="end">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={statusFilter == "FUNCTIONAL"}
                onCheckedChange={(checked) =>
                  handleFilterChange(checked, "FUNCTIONAL")
                }
                onSelect={(e) => e.preventDefault()}
                className="flex items-center gap-2"
              >
                <TbSettingsCheck className="text-green-500" />
                Functional
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter == "UNDER_MAINTENANCE"}
                onCheckedChange={(checked) =>
                  handleFilterChange(checked, "UNDER_MAINTENANCE")
                }
                onSelect={(e) => e.preventDefault()}
                className="flex items-center gap-2"
              >
                <TbSettingsX className="text-red-600" />
                Under maintenance
              </DropdownMenuCheckboxItem>
              <DropdownMenuLabel>Material</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {materials.map((item, index) => (
                <DropdownMenuCheckboxItem
                  key={index}
                  checked={selectedMaterial.includes(item.name)}
                  onCheckedChange={(checked) =>
                    handleMaterialFilterChange(checked, item.name)
                  }
                  onSelect={(e) => e.preventDefault()}
                >
                  {item.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ExportCSV data={data} />
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
