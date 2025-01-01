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
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { BinMaterial, BinStatus } from "@prisma/client";
import Link from "next/link";
import { deleteBin } from "@/app/action/bin";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { MdDeleteForever } from "react-icons/md";
import { TbSettingsCheck, TbSettingsX } from "react-icons/tb";
import { FaEdit, FaTrashRestore } from "react-icons/fa";
import { useState } from "react";
import ConfirmDeleteBinDialog from "@/components/Dialog/ConfirmDeleteBinDialog";

export type Bin = {
  id: string;
  currentCapacity: number;
  _count: { disposals: number };
  user: { name: string | null; location: string | null };
  status: BinStatus;
  binMaterial: { name: string };
  createdAt: Date;
  updatedAt: Date;
};

const BinActions = ({ bin }: { bin: Bin }) => {
  const router = useRouter();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const datetime = new Date().toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    hour12: false, // 24-hour format, remove if 12-hour format is needed
  });

  return (
    <div>
      <ConfirmDeleteBinDialog
        binId={bin.id}
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
          <Link href={`/admin/bin/update/${bin.id}`} passHref>
            <DropdownMenuItem>
              <FaEdit />
              Edit bin
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <MdDeleteForever />
            Delete bin
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push(`/admin/bin/disposal/${bin.id}`)}
          >
            <FaTrashRestore /> View disposals
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export const columns: ColumnDef<Bin>[] = [
  {
    id: "name",
    accessorKey: "user.name",
    header: "Name",
    cell: ({ row }) => {
      const isFunctional = row.original.status != "UNDER_MAINTENANCE";
      return (
        <div className="flex items-center gap-1">
          {isFunctional ? (
            <TbSettingsCheck className="text-green-500" />
          ) : (
            <TbSettingsX className="text-red-600" />
          )}
          {row.original.user.name}
        </div>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: () => null,
    cell: () => null,
  },
  {
    id: "location",
    accessorKey: "user.location",
    header: "Location",
  },
  {
    id: "material",
    accessorKey: "binMaterial.name",
    header: "Material",
    filterFn: (row, columnId, filterValue) => {
      if (Array.isArray(filterValue)) {
        return filterValue.includes(row.getValue(columnId));
      }
      return true; // No filter applied
    },
  },
  {
    id: "capacity",
    accessorKey: "currentCapacity",
    header: "Bin Capacity",
    cell: ({ row }) => {
      const currentCapacity = row.original.currentCapacity;
      return (
        <div
          className={`${
            currentCapacity > 85
              ? "text-red-500"
              : currentCapacity > 60
              ? "text-yellow-500"
              : "text-green-500"
          }`}
        >
          {currentCapacity}%
        </div>
      );
    },
  },
  {
    id: "disposals",
    header: "Disposals",
    accessorKey: "_count.disposals",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <BinActions bin={row.original} />,
  },
];
