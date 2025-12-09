"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import Card from "@/components/Card/Card";
import FormHeader from "@/components/Form/FormHeader";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";

import ConfirmDeleteQuestTemplateDialog from "@/components/Dialog/ConfirmDeleteQuestTemplateDialog";

export interface QuestTemplate {
  id: string;
  title: string;
  materialType: string;
  duration: number;
}

export default function QuestTemplateTable({ data }: { data: QuestTemplate[] }) {
  const [templates, setTemplates] = useState<QuestTemplate[]>(data);

  // Filtering
  const [filterValue, setFilterValue] = useState("");

  const filteredTemplates = templates.filter((t) =>
    t.materialType.toLowerCase().includes(filterValue.toLowerCase())
  );

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / pageSize));

  const paginated = filteredTemplates.slice(
    pageIndex * pageSize,
    pageIndex * pageSize + pageSize
  );

  // Dialog
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  return (
    <Card isAdmin rounded fullWidth className="p-6">
      <FormHeader>Quest Templates</FormHeader>

      {/* Top Actions */}
      <div className="flex justify-between items-center pb-4">
        <Input
          placeholder="Filter by material..."
          className="max-w-xs"
          value={filterValue}
          onChange={(e) => {
            setFilterValue(e.target.value);
            setPageIndex(0);
          }}
        />

        <Link href="/admin/quest-template/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Create Template
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-lg border shadow-sm bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-slate-700 px-4">Title</TableHead>
              <TableHead className="font-bold text-slate-700 px-4">Material</TableHead>
              <TableHead className="font-bold text-slate-700 px-4">Duration</TableHead>
              <TableHead className="font-bold text-slate-700 px-4 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-slate-500"
                >
                  No templates found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((t) => (
                <TableRow
                  key={t.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="px-4 py-3">{t.title}</TableCell>
                  <TableCell className="px-4">{t.materialType}</TableCell>
                  <TableCell className="px-4">{t.duration} days</TableCell>

                  <TableCell className="px-4 text-right">
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-slate-200 rounded-md"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>

                        <DropdownMenuItem asChild>
                          <Link href={`/admin/quest-template/update/${t.id}`}>
                            Edit Template
                          </Link>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteDialog(t.id)}
                        >
                          Delete Template
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        {/* Rows per page */}
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-slate-700">Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 30, 40, 50].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page indicator */}
        <div className="text-sm text-slate-700">
          Page {pageIndex + 1} of {totalPages}
        </div>

        {/* Page buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(0)}
            disabled={pageIndex === 0}
          >
            {"<<"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            disabled={pageIndex === 0}
          >
            {"<"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setPageIndex((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={pageIndex >= totalPages - 1}
          >
            {">"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(totalPages - 1)}
            disabled={pageIndex >= totalPages - 1}
          >
            {">>"}
          </Button>
        </div>
      </div>

      {/* Delete Dialog */}
      {deleteId && (
        <ConfirmDeleteQuestTemplateDialog
          templateId={deleteId}
          isOpen={dialogOpen}
          handleDialogOpen={closeDialog}
        />
      )}
    </Card>
  );
}
