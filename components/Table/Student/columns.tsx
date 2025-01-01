"use client";

import { ColumnDef } from "@tanstack/react-table";
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
    updatedAt: Date;
  } | null;
  _count: {
    disposals: number;
    redemptions: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: "Name",
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
    header: "Points",
    accessorKey: "point.balance",
    cell: ({ row }) => row.original.point?.balance ?? "N/A",
  },
  {
    accessorKey: "faculty",
    header: "Faculty",
  },
  {
    header: "Disposals",
    accessorKey: "_count.disposals",
    cell: ({ row }) => row.original._count?.disposals ?? 0,
  },
  {
    header: "Redemptions",
    accessorKey: "_count.redemptions",
    cell: ({ row }) => row.original._count?.redemptions ?? 0,
  },
  {
    accessorKey: "point.updatedAt",
    header: "Last Active",
    cell: ({ row }) => {
      const date = row.original.point?.updatedAt.toLocaleDateString("en-SG");

      return <div>{date}</div>;
    },
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      return <Actions data={row.original} />;
    },
  },
];
