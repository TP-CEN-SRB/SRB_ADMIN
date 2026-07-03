"use client";

import React, { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable,
  PaginationState,
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

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import Card from "@/components/Card/Card";
import FormHeader from "@/components/FormLogic/FormHeader";
import { Star, Trash2, Eye } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ⭐ Star Rating
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
        }`}
      />
    ))}
  </div>
);

interface Feedback {
  id: string;
  rating: number;
  category: string;
  message?: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function FeedbackPage() {
  const [data, setData] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Feedback | null>(null);

  // Pagination & filters
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const fetchFeedbacks = () => {
    setLoading(true);
    fetch("/api/admin/feedback")
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(fetchFeedbacks, []);

const handleDelete = async () => {
  if (!deleteTarget) return;

  const res = await fetch(`/api/admin/feedback/${deleteTarget.id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    alert("Failed to delete feedback");
    return;
  }

  setDeleteTarget(null);
  fetchFeedbacks();
};

  const columns: ColumnDef<Feedback>[] = [
    {
      header: "User",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.user.name}</p>
          <p className="text-xs text-slate-500">{row.original.user.email}</p>
        </div>
      ),
    },
    {
      header: "Rating",
      cell: ({ row }) => <StarRating rating={row.original.rating} />,
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 font-medium">
          {row.original.category}
        </span>
      ),
    },
    {
      header: "Message",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[200px] text-sm">
            {row.original.message || "—"}
          </span>
          {row.original.message && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedMessage(row.original.message!)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
    {
      header: "Date",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:bg-red-50"
          onClick={() => setDeleteTarget(row.original)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { pagination, columnFilters },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Card isAdmin rounded fullWidth className="p-6">
      <FormHeader>User Feedback</FormHeader>

      {/* Filter */}
      <div className="flex justify-end pb-4">
        <Input
          placeholder="Filter by category..."
          value={
            (table.getColumn("category")?.getFilterValue() as string) ?? ""
          }
          onChange={(e) =>
            table.getColumn("category")?.setFilterValue(e.target.value)
          }
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
                  <TableHead key={header.id} className="font-bold text-slate-700">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  Loading feedback…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.original.id}>
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
                  No feedback found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-700">Rows per page</span>
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm text-slate-700">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(1, table.getPageCount())}
        </div>

        <div className="flex gap-2">
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
        </div>
      </div>

      {/* Message Modal */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback Message</DialogTitle>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm text-slate-700">
            {selectedMessage}
          </p>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feedback</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this feedback?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}