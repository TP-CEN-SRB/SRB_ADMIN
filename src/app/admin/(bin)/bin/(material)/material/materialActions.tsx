"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import { FaEdit } from "react-icons/fa"
import { MdDeleteForever } from "react-icons/md"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ConfirmDeleteMaterialDialog from "./ConfirmDeleteMaterialDialog"

export function MaterialActions({ materialId, hasBins }: { materialId: string; hasBins: boolean }) {
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
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href={`/admin/bin/material/update/${materialId}`}>
              <FaEdit className="mr-2" /> Edit Material
            </Link>
          </DropdownMenuItem>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={hasBins ? "cursor-not-allowed" : ""}>
                  <DropdownMenuItem onClick={() => setDialogOpen(true)} disabled={hasBins}>
                    <MdDeleteForever className="mr-2" /> Delete Material
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {hasBins && (
                <TooltipContent side="left" align="start" sideOffset={10} className="max-w-xs">
                  This material type is in use. Deleting is not allowed.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteMaterialDialog
        materialId={materialId}
        isOpen={isDialogOpen}
        handleDialogOpen={() => setDialogOpen((prev) => !prev)}
      />
    </>
  )
}
