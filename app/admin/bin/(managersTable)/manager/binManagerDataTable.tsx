"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
import { useRouter } from "next/navigation";
import { FaClipboardList, FaEdit, FaPlus, FaPlusCircle } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";
import {
  MdDeleteForever,
  MdMarkEmailRead,
  MdOutlineBarChart,
} from "react-icons/md";
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
import { TooltipProvider } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";

interface BinManager {
  id: string;
  name: string;
  email: string;
  faculty: Faculty;
  _count: { bins: number };
}

interface BinManagerProps {
  data: BinManager[];
}

const BinManagerDataTable = ({ data }: BinManagerProps) => {
  const BinManagerActions = ({ binManager }: { binManager: BinManager }) => {
    const hasBins = binManager._count.bins > 0;
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={hasBins ? "cursor-not-allowed" : ""}>
                    <DropdownMenuItem
                      onClick={() => setDialogOpen(true)}
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
                          This manager has bins assigned. Deleting is not
                          allowed.
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuSeparator />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className={!hasBins ? "cursor-not-allowed" : ""}>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/admin/bin/manager/${binManager.id}`)
                      }
                      disabled={!hasBins}
                    >
                      <MdOutlineBarChart />
                      View bin capacity
                    </DropdownMenuItem>
                  </div>
                </TooltipTrigger>
                {!hasBins && (
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
                        <p className="font-semibold text-gray-800">
                          Unavailable
                        </p>
                        <p className="mt-1 text-sm">
                          You need to create bins before viewing their capacity.
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <Link
              href={`/admin/bin/manager/subscription/${binManager.id}`}
              passHref
            >
              <DropdownMenuItem>
                <MdMarkEmailRead />
                Manage Subscriptions
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
      filterFn: (row, columnId, filterValue) => {
        if (Array.isArray(filterValue)) {
          return filterValue.includes(row.getValue(columnId));
        }
        return true;
      },
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

  const [selectedFaculty, setSelectedFaculty] = useState<string[]>([]);
  const [searchFilter, setSearchFilter] = useState(
    (table.getColumn("name")?.getFilterValue() as string) ?? ""
  );

  const handleFacultyFilterChange = (checked: boolean, faculty: string) => {
    const updateFaculties = checked
      ? [...selectedFaculty, faculty]
      : selectedFaculty.filter((item) => item !== faculty);
    setSelectedFaculty(updateFaculties);
    table
      .getColumn("faculty")
      ?.setFilterValue(updateFaculties.length ? updateFaculties : undefined);
  };
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchFilter(value); // Update the input state
    table.getColumn("name")?.setFilterValue(value);
  };
  return (
    <div className="px-4">
      <div className="flex flex-wrap justify-end items-center gap-3 py-3">
        <div className="max-w-xs">
          <Input
            type="search"
            placeholder="Filter name..."
            value={searchFilter}
            onChange={handleInputChange}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="bg-emerald-600 hover:bg-emerald-700 rounded-lg p-2 text-gray-50 flex items-center gap-x-2 text-sm">
            <FaPlusCircle />
            Filter
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" side="bottom" align="end">
            <DropdownMenuLabel>Faculty</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.values(Faculty).map((item, index) => (
              <DropdownMenuCheckboxItem
                key={index}
                checked={selectedFaculty.includes(item)}
                onCheckedChange={(checked) =>
                  handleFacultyFilterChange(checked, item)
                }
                onSelect={(e) => e.preventDefault()}
              >
                {item}
              </DropdownMenuCheckboxItem>
            ))}
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

export default BinManagerDataTable;
