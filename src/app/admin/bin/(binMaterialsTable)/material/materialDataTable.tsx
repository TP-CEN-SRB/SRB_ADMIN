"use client";

import { BinMaterial } from "@prisma/client";
import React, { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MdDeleteForever } from "react-icons/md";
import { Input } from "@/components/ui/input";
import ConfirmDeleteMaterialDialog from "@/components/Dialog/ConfirmDeleteMaterialDialog";

interface MaterialActionsProps {
  allBinMaterials: { name: string | undefined }[];
  data: BinMaterial[];
}

const MaterialDataTable = ({ allBinMaterials, data }: MaterialActionsProps) => {
  const BinMaterialActions = ({
    binMaterial,
  }: {
    binMaterial: BinMaterial;
  }) => {
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [hasBins, setHasBins] = useState(
      allBinMaterials.some((material) => material.name == binMaterial.name)
    );
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false, // 24-hour format, remove if 12-hour format is needed
    });
    return (
      <div>
        <ConfirmDeleteMaterialDialog
          isOpen={isDialogOpen}
          handleDialogOpen={() => setDialogOpen(!isDialogOpen)}
          materialId={binMaterial.id}
        />
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="hover:bg-gray-300 h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link
              href={`/admin/bin/material/update/${binMaterial.id}`}
              passHref
              prefetch
            >
              <DropdownMenuItem>
                <FaEdit />
                Edit material
              </DropdownMenuItem>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={hasBins ? "cursor-not-allowed" : ""}>
                  <DropdownMenuItem
                    onClick={() => setDialogOpen(true)}
                    disabled={hasBins}
                  >
                    <MdDeleteForever />
                    Delete material
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {hasBins && (
                <TooltipContent
                  side="left"
                  align="start"
                  sideOffset={10}
                  className="bg-white border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg shadow-lg max-w-xs"
                >
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M12 20c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z"
                      />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-800">Warning</p>
                      <p className="mt-1 text-sm">
                        This material type is in use. Deleting is not allowed.
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };
  const columns: ColumnDef<BinMaterial>[] = [
    {
      accessorKey: "name",
      header: "Material",
    },
    {
      accessorKey: "multiplier",
      header: "Multiplier",
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => <BinMaterialActions binMaterial={row.original} />,
    },
  ];
  const [pagination, setPagination] = useState<PaginationState>({
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
  const [filterValue, setFilterValue] = useState(
    (table.getColumn("name")?.getFilterValue() as string) ?? ""
  );
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilterValue(value); // Update the input state
    table.getColumn("name")?.setFilterValue(value); // Update the table filter
  };
  return (
    <div className="px-4">
      <div className="flex flex-wrap justify-end items-center gap-3 py-3">
        <div className="max-w-xs">
          <Input
            placeholder="Filter Material..."
            value={filterValue}
            type="search"
            onChange={handleInputChange}
          />
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
            {Math.max(1, table.getPageCount())}
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
  );
};

export default MaterialDataTable;
