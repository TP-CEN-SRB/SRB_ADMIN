"use client";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { FaEdit, FaTrashRestore } from "react-icons/fa";
import Link from "next/link";

import Card from "@/components/Card/Card";
import FormHeader from "@/components/Form/FormHeader";
import ConfirmDeleteQuestDialog from "@/components/Dialog/ConfirmDeleteQuestDialog";

interface Quest {
  id: string;
  name: string;
  material: string;
}

interface QuestDataTableProps {
  data: Quest[];
}

const QuestActions = ({ quest }: { quest: Quest }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-slate-200 h-8 w-8 p-0 rounded-md"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <Link href={`/admin/quest/update/${quest.id}`} passHref>
            <DropdownMenuItem>
              <FaEdit className="mr-2" /> Edit Quest
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <FaTrashRestore className="mr-2" /> Delete Quest
          </DropdownMenuItem>

          <Link href={`/admin/quest/${quest.id}/users`} passHref>
            <DropdownMenuItem>
              <FaTrashRestore className="mr-2" /> View Users
            </DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteQuestDialog
        questId={quest.id}
        isOpen={isDialogOpen}
        handleDialogOpen={() => setDialogOpen((prev) => !prev)}
      />
    </>
  );
};

export default function QuestDataTable({ data }: QuestDataTableProps) {
  const columns: ColumnDef<Quest>[] = [
    { accessorKey: "name", header: "Quest Name" },
    { accessorKey: "material", header: "Material" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <QuestActions quest={row.original} />,
    },
  ];

  // State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Table Instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    state: { pagination, columnFilters },
  });

  // Search Filter
  const [filterValue, setFilterValue] = useState(
    (table.getColumn("material")?.getFilterValue() as string) ?? ""
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilterValue(value);
    table.getColumn("material")?.setFilterValue(value);
  };

  return (
    <Card isAdmin rounded fullWidth className="p-6">
      <FormHeader>Current Active Quests Rotation</FormHeader>

      {/* Filter Bar */}
      <div className="flex justify-end pb-4">
        <Input
          placeholder="Filter by material..."
          value={filterValue}
          onChange={handleInputChange}
          className="max-w-xs"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border shadow-sm bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-bold text-slate-700"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                  className="h-24 text-center text-slate-500"
                >
                  No quests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">

        {/* Rows Per Page */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-700">Rows per page</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
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

        {/* Page indicator */}
        <div className="text-sm text-slate-700">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(1, table.getPageCount())}
        </div>

        {/* Page buttons */}
        <div className="flex space-x-2">
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
    </Card>
  );
}
