"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { ImageIcon } from "lucide-react"
import { TransactionType } from "@/generated/prisma"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
export type Transaction = {
  id: string
  pointsChange: number
  description: string
  transactionType: TransactionType
  queueId?: string | null
  createdAt: Date
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.createdAt.toLocaleDateString("en-SG")

      return <div>{date}</div>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }) => {
      const time = row.original.createdAt.toLocaleTimeString("en-SG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })

      return <div>{time}</div>
    },
  },
  {
    accessorKey: "transactionType",
    header: "Type",
  },
  {
    accessorKey: "pointsChange",
    header: "Points",
    cell: ({ row }) => {
      const pointsChange = row.original.pointsChange
      return (
        <div
          className={`${pointsChange > 0 ? "text-green-500" : "text-red-500"}`}
        >
          {Math.abs(pointsChange)}
        </div>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="line-clamp-1 whitespace-pre-line max-w-[200px] truncate">
              {description}
            </TooltipTrigger>
            <TooltipContent className="max-w-[200px] w-full overflow-x-auto">
              {description}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const { transactionType, queueId } = row.original
      if (transactionType !== "DISPOSAL" || !queueId) return null

      return (
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/transaction/disposal/${queueId}`}>
            <ImageIcon className="mr-1 size-3.5" />
            More
          </Link>
        </Button>
      )
    },
  },
]
