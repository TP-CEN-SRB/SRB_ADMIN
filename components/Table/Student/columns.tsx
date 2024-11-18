"use client";

import { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { FaLongArrowAltUp } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MdVerified } from "react-icons/md";
import { MdGppBad } from "react-icons/md";
import Actions from "./actions";
export type Student = {
  id: string;
  email: string;
  emailVerified: Date | null;
  name: string | null;
  point: {
    balance: number;
  } | null;
  _count: {
    disposals: number;
  };
};

const handleClick = (column: Column<Student, unknown>) => {
  const currentSort = column.getIsSorted();
  if (currentSort === "asc") {
    column.toggleSorting(true);
  } else if (currentSort === "desc") {
    column.clearSorting();
  } else {
    column.toggleSorting(false);
  }
};

const SortIcon = ({ column }: { column: Column<Student, unknown> }) => {
  const currentSort = column.getIsSorted();
  return currentSort === "asc" ? (
    <FaLongArrowAltUp className="h-4 w-4 -rotate-180 transition-transform duration-500" />
  ) : currentSort === "desc" ? (
    <FaLongArrowAltUp className="h-4 w-4 transition-transform duration-500" />
  ) : (
    <ArrowUpDown className="h-4 w-4" />
  );
};
export const columns: ColumnDef<Student>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-x-3">
          Name
          <Button
            variant="ghost"
            className="hover:bg-gray-300"
            onClick={() => handleClick(column)}
          >
            <SortIcon column={column} />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const isVerified = row.original.emailVerified != null;
      return (
        <div className="flex items-center gap-1">
          {isVerified ? (
            <MdVerified className="text-green-500" />
          ) : (
            <MdGppBad className="text-red-600" />
          )}
          {row.original.name}
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-x-3">
          Points
          <Button
            variant="ghost"
            className="hover:bg-gray-300"
            onClick={() => handleClick(column)}
          >
            <SortIcon column={column} />
          </Button>
        </div>
      );
    },
    accessorKey: "point.balance",
    cell: ({ row }) => row.original.point?.balance ?? "N/A",
  },
  {
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-x-3">
          Disposals
          <Button
            variant="ghost"
            className="hover:bg-gray-300"
            onClick={() => handleClick(column)}
          >
            <SortIcon column={column} />
          </Button>
        </div>
      );
    },
    accessorKey: "_count.disposals",
    cell: ({ row }) => row.original._count?.disposals ?? 0,
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      return <Actions data={row.original} />;
    },
  },
];
