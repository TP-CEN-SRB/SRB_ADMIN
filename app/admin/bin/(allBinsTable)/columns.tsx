"use client";

import { BinSchema } from "@/schemas";
import { ColumnDef } from "@tanstack/react-table";
import { z } from "zod";

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

export type Bin = {
  location: string;
  status: BinStatus;
  material: BinMaterial;
  userId: string;
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
    accessorKey: "userId",
    header: "Name",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const bin = row.original;

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
            <DropdownMenuItem
            //onClick={() => navigator.clipboard.writeText("Dropdown")}
            >
              Edit
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator /> */}
            {/* Add a line below something like <br/> */}
            <DropdownMenuItem>Delete</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Chart</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
