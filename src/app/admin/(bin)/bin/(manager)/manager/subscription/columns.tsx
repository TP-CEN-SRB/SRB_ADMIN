"use client"

import { ColumnDef } from "@tanstack/react-table"
import Actions from "./actions"
export type Subscription = {
  id: string
  email: string
}

export const columns: ColumnDef<Subscription>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    header: "Actions",
    id: "actions",
    cell: ({ row }) => {
      return <Actions data={row.original} />
    },
  },
]
