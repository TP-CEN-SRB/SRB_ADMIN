"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import { FaEdit, FaTrashRestore, FaHistory } from "react-icons/fa"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ConfirmDeleteStoreDialog from "@/components/Dialog/ConfirmDeleteStoreDialog"

export function StoreActions({ storeId }: { storeId: string }) {
  const [isDialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link href={`/admin/store/update/${storeId}`}>
              <FaEdit className="mr-2" /> Edit Store
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <FaTrashRestore className="mr-2" /> Delete Store
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`/admin/store/${storeId}`}>
              <FaHistory className="mr-2" /> View History
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteStoreDialog
        storeId={storeId}
        isOpen={isDialogOpen}
        handleDialogOpen={() => setDialogOpen((prev) => !prev)}
      />
    </>
  )
}
