"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal } from "lucide-react"
import { FaEdit, FaTrashRestore, FaCaretSquareDown, FaCaretSquareUp } from "react-icons/fa"
import { MdDeleteForever } from "react-icons/md"
import { BiSolidDoorOpen } from "react-icons/bi"
import { RiDoorFill } from "react-icons/ri"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ConfirmDeleteBinDialog from "@/components/Dialog/ConfirmDeleteBinDialog"
import { publishMqtt } from "@/lib/mqtt"
import { ableToPublishMqttMessage, updateCommandUpdatedAt } from "@/utils/mqttPublisher"
import { Bin } from "./columns"

export function BinActions({ bin }: { bin: Bin }) {
  const router = useRouter()
  const [isDialogOpen, setDialogOpen] = useState(false)

  async function sendCommand(command: string) {
    const ableToPublish = await ableToPublishMqttMessage(bin.userId)
    if (!ableToPublish) {
      toast.error("Cooldown active", {
        description: "Please wait a few seconds before sending another command.",
      })
      return
    }

    const success = await publishMqtt(
      `srb/${bin.binMaterial.name.toLowerCase()}/${bin.userId}`,
      JSON.stringify({ command })
    )

    if (success) {
      toast.success("Command sent", { description: `"${command}" sent to the bin.` })
      await updateCommandUpdatedAt(bin.userId)
    } else {
      toast.error("Failed to send command")
    }
  }

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
            <Link href={`/admin/bin/update/${bin.id}`}>
              <FaEdit className="mr-2" /> Edit Bin
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <MdDeleteForever className="mr-2" /> Delete Bin
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push(`/admin/bin/disposal/${bin.id}`)}>
            <FaTrashRestore className="mr-2" /> View Disposals
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Commands</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => sendCommand("open")}>
            <BiSolidDoorOpen className="mr-2 -rotate-90" /> Open Lid
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => sendCommand("close")}>
            <RiDoorFill className="mr-2 rotate-90" /> Close Lid
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => sendCommand("up")}>
            <FaCaretSquareUp className="mr-2" /> Raise Bin
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => sendCommand("down")}>
            <FaCaretSquareDown className="mr-2" /> Lower Bin
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDeleteBinDialog
        binId={bin.id}
        isOpen={isDialogOpen}
        handleDialogOpen={() => setDialogOpen((prev) => !prev)}
      />
    </>
  )
}
