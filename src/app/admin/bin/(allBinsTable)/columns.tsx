"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { BinStatus } from "@/generated/prisma"
import Link from "next/link"
import { BiSolidDoorOpen } from "react-icons/bi"
import { useRouter } from "next/navigation"
import { MdDeleteForever } from "react-icons/md"
import { TbSettingsCheck, TbSettingsX } from "react-icons/tb"
import {
  FaCaretSquareDown,
  FaCaretSquareUp,
  FaEdit,
  FaLock,
  FaLockOpen,
  FaTrashRestore,
} from "react-icons/fa"
import { RiDoorFill } from "react-icons/ri"
import { useState } from "react"
import ConfirmDeleteBinDialog from "@/components/Dialog/ConfirmDeleteBinDialog"
import { publishMqtt } from "@/lib/mqtt"
import { toast } from "sonner"
import {
  ableToPublishMqttMessage,
  updateCommandUpdatedAt,
} from "@/utils/mqttPublisher"

export type Bin = {
  id: string
  currentCapacity: number
  _count: { disposals: number }
  userId: string
  clearCount: number
  user: { name: string | null; location: string | null }
  status: BinStatus
  binMaterial: { name: string }
  createdAt: Date
  updatedAt: Date
}

const BinActions = ({ bin }: { bin: Bin }) => {
  const router = useRouter()
  const [isDialogOpen, setDialogOpen] = useState(false)
  const datetime = new Date().toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    hour12: false, // 24-hour format, remove if 12-hour format is needed
  })
  const publishMessage = async (command: string) => {
    const ableToPublish = await ableToPublishMqttMessage(bin.userId)
    if (!ableToPublish) {
      toast.error("Error!",{
        description:
          "Unable to send command at this time, please try again in a few seconds",
      })
      return
    }
    const success = await publishMqtt(
      `srb/${bin.binMaterial.name.toLowerCase()}/${bin.userId}`,
      JSON.stringify({ command: command })
    )
    if (success) {
      toast.success("success!",{
        description: "Command sent successfully",
      })
      await updateCommandUpdatedAt(bin.userId)
    } else {
      toast.error("Error!", {
        description: "Failed to send command",
      })
    }
  }

  return (
    <div>
      <ConfirmDeleteBinDialog
        binId={bin.id}
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
          <Link href={`/admin/bin/update/${bin.id}`} passHref>
            <DropdownMenuItem>
              <FaEdit />
              Edit bin
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <MdDeleteForever />
            Delete bin
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push(`/admin/bin/disposal/${bin.id}`)}
          >
            <FaTrashRestore /> View disposals
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Commands</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={async () => {
              await publishMessage("open")
            }}
          >
            <BiSolidDoorOpen className="-rotate-90" />
            Open
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await publishMessage("close")
            }}
          >
            <RiDoorFill className="rotate-90" />
            Close
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await publishMessage("lock")
            }}
          >
            <FaLock />
            Lock
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await publishMessage("unlock")
            }}
          >
            <FaLockOpen />
            Unlock
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await publishMessage("up")
            }}
          >
            <FaCaretSquareUp />
            Lift up
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={async () => {
              await publishMessage("down")
            }}
          >
            <FaCaretSquareDown />
            Lift down
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const columns: ColumnDef<Bin>[] = [
  {
    id: "name",
    accessorKey: "user.name",
    header: "Name",
    cell: ({ row }) => {
      const isFunctional = row.original.status != "UNDER_MAINTENANCE"
      return (
        <div className="flex items-center gap-1">
          {isFunctional ? (
            <TbSettingsCheck className="text-green-500" />
          ) : (
            <TbSettingsX className="text-red-600" />
          )}
          {row.original.user.name}
        </div>
      )
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: () => null,
    cell: () => null,
  },
  {
    id: "location",
    accessorKey: "user.location",
    header: "Location",
  },
  {
    id: "material",
    accessorKey: "binMaterial.name",
    header: "Material",
    filterFn: (row, columnId, filterValue) => {
      if (Array.isArray(filterValue)) {
        return filterValue.includes(row.getValue(columnId))
      }
      return true // No filter applied
    },
  },
  {
    id: "capacity",
    accessorKey: "currentCapacity",
    header: "Bin Capacity",
    cell: ({ row }) => {
      const currentCapacity = row.original.currentCapacity
      return (
        <div
          className={`${
            currentCapacity > 85
              ? "text-red-500"
              : currentCapacity > 60
              ? "text-yellow-500"
              : "text-green-500"
          }`}
        >
          {currentCapacity}%
        </div>
      )
    },
  },
  {
    id: "disposals",
    header: "Disposals",
    accessorKey: "_count.disposals",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <BinActions bin={row.original} />,
  },
]