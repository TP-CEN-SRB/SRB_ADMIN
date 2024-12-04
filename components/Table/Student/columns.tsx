"use client";

import { Column, ColumnDef } from "@tanstack/react-table";

import { FaSort } from "react-icons/fa";
import { FaLongArrowAltUp } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { MdVerified } from "react-icons/md";
import { MdGppBad } from "react-icons/md";
import Actions from "./actions";
import { Faculty } from "@prisma/client";
export type Student = {
  id: string;
  email: string;
  emailVerified: Date | null;
  faculty: Faculty | null;
  name: string | null;
  point: {
    balance: number;
  } | null;
  _count: {
    disposals: number;
    redemptions: number;
  };
  createdAt: Date;
  updatedAt: Date;
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
    <FaSort className="h-4 w-4" />
  );
};
export const columns: ColumnDef<Student>[] = [
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
    accessorKey: "faculty",
    header: "Faculty",
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
    header: ({ column }) => {
      return (
        <div className="flex items-center gap-x-3">
          Redemptions
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
    accessorKey: "_count.redemptions",
    cell: ({ row }) => row.original._count?.redemptions ?? 0,
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      return <Actions data={row.original} />;
    },
  },
];
