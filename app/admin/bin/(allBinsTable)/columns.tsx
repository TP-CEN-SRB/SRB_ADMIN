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
import { BinStatus } from "@prisma/client";
import Link from "next/link";
import { deleteBin } from "@/app/action/bin";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export type Bin = {
  location: string;
  status: BinStatus;
  material: string;
  binId: string;
  userName: string;
};

export const columns: ColumnDef<Bin>[] = [
  {
    accessorKey: "location",
    header: "Location",
  },
  {
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
    accessorKey: "material",
    header: "Material",
  },
  {
    accessorKey: "userName",
    header: "Name",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const bin = row.original;
      const [isPending, startTransition] = useTransition();
      const { toast } = useToast();
      const [error, setError] = useState("");
      const [success, setSuccess] = useState("");
      const datetime = new Date().toLocaleString("en-SG", {
        timeZone: "Asia/Singapore",
        hour12: false, // 24-hour format, remove if 12-hour format is needed
      });
      const onDelete = (id: string) => {
        const deleteSelectedBin = async () => {
          const router = useRouter();
          startTransition(async () => {
            const result = await deleteBin(id);
            if (result?.success) {
              setSuccess(result?.success as string);
              toast({
                title: "Bin deleted successfully",
                description: (
                  <div>
                    Bin deleted at{" "}
                    {new Date().toLocaleString("en-SG", {
                      timeZone: "Asia/Singapore",
                      hour12: false,
                    })}
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
          });
        };
        deleteSelectedBin();
      };

      return (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href={`/admin/bin/update/${bin.binId}`} passHref>
              <DropdownMenuItem>Edit</DropdownMenuItem>
            </Link>
            <DropdownMenuItem onClick={() => onDelete(bin.binId)}>
              Delete
            </DropdownMenuItem>
            <DropdownMenuSeparator className="border-t-2 border-gray-200" />
            <DropdownMenuItem>View Chart</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
