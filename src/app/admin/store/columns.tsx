"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { FaEdit, FaTrashRestore, FaHistory } from "react-icons/fa"
import { useState } from "react"
import ConfirmDeleteDialog from "@/components/Dialog/ConfirmDeleteStoreDialog"

export type Store = {
  id: string
  name: string
  email: string
  faculty: string
  totalPoints: number
  lastActive: string
  totalPurchases: number
}

const StoreActions = ({ store }: { store: Store }) => {
  const [isDialogOpen, setDialogOpen] = useState(false)

  return (
    <div>
      <ConfirmDeleteDialog
        storeId={store.id}
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

          <Link href={`/admin/store/update/${store.id}`} passHref>
            <DropdownMenuItem>
              <FaEdit className="mr-2" /> Edit Store
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <FaTrashRestore className="mr-2" /> Delete Store
          </DropdownMenuItem>

          <Link href={`/admin/store/${store.id}`} passHref>
            <DropdownMenuItem>
              <FaHistory className="mr-2" /> View History
            </DropdownMenuItem>
          </Link>

        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const columns: ColumnDef<Store>[] = [
  {
    accessorKey: "name",
    header: "Store Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "faculty",
    header: "Faculty",
  },
  {
    accessorKey: "totalPoints",
    header: "Points",
    cell: ({ getValue }) => getValue<number>()?.toLocaleString(),
  },
  {
    accessorKey: "lastActive",
    header: "Last Active",
    cell: ({ getValue }) =>
      getValue<string>()
        ? new Date(getValue<string>()).toLocaleString("en-SG")
        : "N/A",
  },
  {
    accessorKey: "totalPurchases",
    header: "Total Purchases",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <StoreActions store={row.original} />,
  },
]
