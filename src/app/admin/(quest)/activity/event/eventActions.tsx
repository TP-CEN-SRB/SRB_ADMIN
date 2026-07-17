"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import { FaEdit, FaTrashRestore, FaUsers } from "react-icons/fa"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ConfirmDeleteEventDialog from "@/components/Dialog/ConfirmDeleteEventDialog"

export function EventActions({ eventId }: { eventId: string }) {
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
            <Link href={`/admin/activity/event/update/${eventId}`}>
              <FaEdit className="mr-2" /> Edit Event
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <FaTrashRestore className="mr-2" /> Delete Event
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`/admin/activity/event/${eventId}/users`}>
              <FaUsers className="mr-2" /> View Users
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteEventDialog
        eventId={eventId}
        isOpen={isDialogOpen}
        handleDialogOpen={() => setDialogOpen((prev) => !prev)}
      />
    </>
  )
}
