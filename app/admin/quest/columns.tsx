"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FaEdit,
  FaTrashRestore,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import ConfirmDeleteDialog from "@/components/Dialog/ConfirmDeleteQuestDialog";

export type Quest = {
  id: string;
  title: string;
  description: string;
  target: number;
  materialType: string;
  rewardPoints: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
};

const QuestActions = ({ quest }: { quest: Quest }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  return (
    <div>
      <ConfirmDeleteDialog
        questId={quest.id}
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
          <Link href={`/admin/quest/update/${quest.id}`} passHref>
            <DropdownMenuItem>
              <FaEdit className="mr-2" /> Edit Quest
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <FaTrashRestore className="mr-2" /> Delete Quest
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => alert("View users not implemented")}>
            <FaTrashRestore className="mr-2" /> View Users
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
export const columns: ColumnDef<Quest>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "materialType",
    header: "Material Type",
  },
  {
    accessorKey: "target",
    header: "Target",
  },
  {
    accessorKey: "rewardPoints",
    header: "Reward Points",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) =>
      row.original.startDate ? new Date(row.original.startDate).toLocaleDateString("en-SG") : "-",
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) =>
      row.original.endDate ? new Date(row.original.endDate).toLocaleDateString("en-SG") : "-",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleString("en-SG", {
        timeZone: "Asia/Singapore",
      }),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <QuestActions quest={row.original} />,
  },
];
