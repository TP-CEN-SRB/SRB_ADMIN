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
import { FaEdit } from "react-icons/fa";

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
  const datetime = new Date().toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    hour12: false, // 24-hour format, remove if 12-hour format is needed
  });

  const onDelete = async (id: string) => {
    const result = await deleteBin(id);
    if (result?.success) {
      toast({
        title: "Bin deleted successfully",
        description: (
          <div>
            Bin deleted at {datetime}
            <br />
            <br />
            <strong>Bin ID: </strong> {id}
          </div>
        ),
        duration: 2000,
        variant: "default",
      });
      router.refresh();
    }
  };

  return (
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
        <DropdownMenuItem onClick={() => onDelete(bin.id)}>
          <MdDeleteForever />
          Delete bin
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<Bin>[] = [
  {
    id: "location",
    accessorKey: "user.location",
    header: "Location",
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const bin = row.original;
      return (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            bin.status === "FUNCTIONAL"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {bin.status}
        </span>
      );
    },
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
    id: "username",
    accessorKey: "user.name",
    header: "Name",
  },
  {
    id: "capacity",
    accessorKey: "currentCapacity",
    header: "Bin Capacity",
    cell: ({ row }) => {
      return <div>{row.original.currentCapacity.toFixed(2)}%</div>;
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
