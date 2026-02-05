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
import FormHeader from "@/components/Form/FormHeader";
import { Trash2, Eye, ImageIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FaultReport {
  id: string;
  location: string;
  category: string;
  type: string;
  description?: string | null;
  faultimageUrl?: string | null;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;

  takenByTelegramName?: string | null;
  resolvedByTelegramName?: string | null;
  takenByAdminName?: string | null;
  resolvedByAdminName?: string | null;

  user: {
    name: string;
    email: string;
  };
}

const STATUS_STYLES: Record<FaultReport["status"], string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
};

const formatStatus = (status: string) =>
  status.replace("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export default function FaultReportsPage() {
  const [data, setData] = useState<FaultReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FaultReport | null>(null);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const fetchReports = () => {
    setLoading(true);
    fetch("/api/admin/fault-reports", { credentials: "include" })
      .then((res) => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  const updateStatus = async (id: string, status: FaultReport["status"]) => {
    // optimistic UI update
    setData((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

    const res = await fetch(`/api/admin/fault-reports/${id}/status`, {
    method: "PATCH",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      alert("Failed to update status");
      fetchReports(); // rollback
    } else {
      // refresh to pull handledBy names that backend sets
      fetchReports();
    }
  };

  useEffect(fetchReports, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;

    const res = await fetch(`/api/admin/fault-reports/${deleteTarget.id}/delete`, {
      method: "DELETE",
      credentials: "include", // ✅ IMPORTANT
    });

    if (!res.ok) {
      alert("Failed to delete fault report");
      return;
    }

    setDeleteTarget(null);
    fetchReports();
  };

  const columns: ColumnDef<FaultReport>[] = [
    {
      header: "Report ID",
      cell: ({ row }) => row.original.id,
    },
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
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
          {row.original.category}
        </span>
      ),
    },
    {
      header: "Location",
      cell: ({ row }) => row.original.location,
    },
    {
      header: "Description",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="truncate max-w-[200px] text-sm">
            {row.original.description || "—"}
          </span>
          {row.original.description && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDescription(row.original.description!)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
    {
      header: "Image",
      cell: ({ row }) =>
        row.original.faultimageUrl ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedImage(row.original.faultimageUrl!)}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      header: "Date",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleString("en-SG"),
    },
    {
    header: "Handled By",
    cell: ({ row }) => {
        const r = row.original;

        const taken =
        r.takenByTelegramName ||
        r.takenByAdminName ||
        (r.status !== "OPEN" ? "Admin Dashboard" : null);

        const resolved =
        r.resolvedByTelegramName ||
        r.resolvedByAdminName ||
        (r.status === "RESOLVED" ? "Admin Dashboard" : null);

        return (
        <div className="text-xs text-slate-600 whitespace-nowrap">
            {taken && <p>🛠 {taken}</p>}
            {resolved && <p>✅ {resolved}</p>}
        </div>
        );
    },
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const report = row.original;

        return (
          <div className="flex items-center gap-2">
            <Select
              disabled={report.status === "RESOLVED"}
              value={report.status}
              onValueChange={(v) => updateStatus(report.id, v as FaultReport["status"])}
            >
              <SelectTrigger
                className={`h-8 min-w-[140px] px-3 text-xs font-medium rounded-full border-none whitespace-nowrap ${STATUS_STYLES[report.status]}`}
              >
                <SelectValue>{formatStatus(report.status)}</SelectValue>
              </SelectTrigger>

              <SelectContent>
                {report.status === "OPEN" && (
                  <SelectItem value="IN_PROGRESS">
                    <span className="text-yellow-600">In Progress</span>
                  </SelectItem>
                )}

                {report.status !== "RESOLVED" && (
                  <SelectItem value="RESOLVED">
                    <span className="text-green-600">Resolved</span>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={() => setDeleteTarget(report)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
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
      <FormHeader>Fault Reports</FormHeader>

      <div className="flex justify-between gap-4 pb-4">
        <Input
          placeholder="Filter by category..."
          value={(table.getColumn("category")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("category")?.setFilterValue(e.target.value)}
          className="max-w-xs"
        />

        <Select
          value={(table.getColumn("status")?.getFilterValue() as string) ?? "ALL"}
          onValueChange={(v) => {
            if (v === "ALL") table.getColumn("status")?.setFilterValue(undefined);
            else table.getColumn("status")?.setFilterValue(v);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border shadow-sm bg-white">
        <Table>
          <TableHeader className="bg-slate-50">
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-8">
                  Loading fault reports…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.original.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No fault reports found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between pt-4">
        <span className="text-sm">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {Math.max(1, table.getPageCount())}
        </span>

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

      <Dialog open={!!selectedDescription} onOpenChange={() => setSelectedDescription(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fault Description</DialogTitle>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm">{selectedDescription}</p>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Uploaded Image</DialogTitle>
          </DialogHeader>
          <img src={selectedImage!} alt="Fault" className="rounded-lg" />
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Fault Report</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this fault report?
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