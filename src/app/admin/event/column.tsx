"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FaEdit, FaTrashRestore } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import ConfirmDeleteEventDialog from "@/components/Dialog/ConfirmDeleteEventDialog"

export type Event = {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  createdAt: Date
}

const EventActions = ({ event }: { event: Event }) => {
  const [isDialogOpen, setDialogOpen] = useState(false)
  return (
    <div>
      <ConfirmDeleteEventDialog
        eventId={event.id}
        isOpen={isDialogOpen}
        handleDialogOpen={() => setDialogOpen((prev) => !prev)}
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
          <Link href={`/admin/event/update/${event.id}`} passHref>
            <DropdownMenuItem>
              <FaEdit className="mr-2" /> Edit Event
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <FaTrashRestore className="mr-2" /> Delete Event
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const columns: ColumnDef<Event>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) =>
      new Date(row.original.startDate).toLocaleDateString("en-SG"),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) =>
      new Date(row.original.endDate).toLocaleDateString("en-SG"),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleString("en-SG", {
        timeZone: "Asia/Singapore",
      }),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <EventActions event={row.original} />,
  },
]
