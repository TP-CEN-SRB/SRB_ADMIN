"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal } from "lucide-react"
import { FaEdit, FaPlus } from "react-icons/fa"
import { MdDeleteForever, MdMarkEmailRead, MdOutlineBarChart } from "react-icons/md"
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
import ConfirmDeleteBinManagerDialog from "@/components/Dialog/ConfirmDeleteBinManagerDialog"

interface BinManagerActionsProps {
  binManagerId: string
  binCount: number
}

export function BinManagerActions({ binManagerId, binCount }: BinManagerActionsProps) {
  const hasBins = binCount > 0
  const [isDialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

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
            <Link href={`/admin/bin/manager/update/${binManagerId}`}>
              <FaEdit className="mr-2" /> Edit Manager
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`/admin/bin/create/${binManagerId}`}>
              <FaPlus className="mr-2" /> Create Bin
            </Link>
          </DropdownMenuItem>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                    <MdDeleteForever className="mr-2 text-red-500" /> Delete Manager
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {hasBins && (
                <TooltipContent side="left" align="start" sideOffset={10} className="max-w-xs">
                  This manager has {binCount} bins linked. Deleting will remove all of them.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <DropdownMenuSeparator />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={!hasBins ? "cursor-not-allowed" : ""}>
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/bin/manager/${binManagerId}`)}
                    disabled={!hasBins}
                  >
                    <MdOutlineBarChart className="mr-2" /> View Bin Capacity
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {!hasBins && (
                <TooltipContent side="left" align="start" sideOffset={10} className="max-w-xs">
                  You need to create bins before viewing their capacity.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <DropdownMenuItem asChild>
            <Link href={`/admin/bin/manager/subscription/${binManagerId}`}>
              <MdMarkEmailRead className="mr-2" /> Manage Subscriptions
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteBinManagerDialog
        userId={binManagerId}
        isOpen={isDialogOpen}
        handleDialogOpen={() => setDialogOpen((prev) => !prev)}
      />
    </>
  )
}
