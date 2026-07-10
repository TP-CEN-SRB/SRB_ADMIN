"use client"

import { ColumnDef } from "@tanstack/react-table"
import { BsPersonFillCheck, BsPersonFillX } from "react-icons/bs"
export type Disposal = {
  id: string
  weightInGrams: number
  isRedeemed: boolean
  pointsAwarded: number
  userId: string | null
  createdAt: Date
  imageUrl: string | null
}

export const columns: ColumnDef<Disposal>[] = [
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => {
      const date = row.original.createdAt.toLocaleDateString("en-SG")

      return (
        <div className="flex items-center gap-1">
          {row.original.isRedeemed ? (
            <BsPersonFillCheck className="text-green-500" />
          ) : (
            <BsPersonFillX className="text-red-600" />
          )}
          {date}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Time",
    cell: ({ row }) => {
      const time = row.original.createdAt.toLocaleTimeString("en-SG", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })

      return <div>{time}</div>
    },
  },
  {
    accessorKey: "weightInGrams",
    header: "Weight (g)",
  },
  {
    accessorKey: "pointsAwarded",
    header: "Points Awarded",
  },
  {
    accessorKey: "imageUrl",
    header: "Image",
    cell: ({ row }) => {
      const url = row.original.imageUrl
      if (!url) return <span className="text-muted-foreground">—</span>
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Detected item"
            className="h-10 w-10 rounded object-cover hover:opacity-80"
          />
        </a>
      )
    },
  },
]
