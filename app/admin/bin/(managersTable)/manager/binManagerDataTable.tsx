"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@radix-ui/react-tooltip";
import { toast } from "@/hooks/use-toast";
import { deleteBinUser } from "@/app/action/user";
import { useRouter } from "next/navigation";
import { FaEdit, FaPlus } from "react-icons/fa";
import { MdDeleteForever, MdOutlineBarChart } from "react-icons/md";
import { Faculty } from "@prisma/client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  PaginationState,
  getFilteredRowModel,
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import ConfirmDeleteBinManagerDialog from "@/components/Dialog/ConfirmDeleteBinManagerDialog";

interface BinManager {
  id: string;
  name: string;
  email: string;
  faculty: Faculty;
}

interface BinManagerProps {
  data: BinManager[];
  allBinManagers: BinManager[];
}

const BinManagerDataTable = ({ data, allBinManagers }: BinManagerProps) => {
  const BinManagerActions = ({ binManager }: { binManager: BinManager }) => {
    const [hasBins, setHasBins] = useState(
      allBinManagers.some((binUser) => binUser.id == binManager.id)
    );
    const [isDialogOpen, setDialogOpen] = useState(false);
    const router = useRouter();
    const datetime = new Date().toLocaleString("en-SG", {
      timeZone: "Asia/Singapore",
      hour12: false, // 24-hour format, remove if 12-hour format is needed
    });

    return (
      <div>
        <ConfirmDeleteBinManagerDialog
          userId={binManager.id}
          isOpen={isDialogOpen}
          handleDialogOpen={() => setDialogOpen(!isDialogOpen)}
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
            <Link href={`/admin/bin/manager/update/${binManager.id}`} passHref>
              <DropdownMenuItem>
                <FaEdit />
                Edit manager
              </DropdownMenuItem>
            </Link>
            <Link href={`/admin/bin/create/${binManager.id}`} passHref>
              <DropdownMenuItem>
                <FaPlus />
                Create bin
              </DropdownMenuItem>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenuItem
                    onClick={() => setDialogOpen(true)}
                    className={hasBins ? "cursor-not-allowed opacity-50" : ""}
                    disabled={hasBins}
                  >
                    <MdDeleteForever />
                    Delete manager
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
                        This manager has bins assigned. Deleting is not allowed.
                      </p>
                    </div>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
            <DropdownMenuSeparator />

            <Link href={`/admin/bin/manager/${binManager.id}`} passHref>
              <DropdownMenuItem>
                <MdOutlineBarChart />
                View bin capacity
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };
  const columns: ColumnDef<BinManager>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "faculty",
      header: "Faculty",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <BinManagerActions binManager={row.original} />,
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
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });
  return (
    <div className="px-4">
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
  );
};

export default BinManagerDataTable;
