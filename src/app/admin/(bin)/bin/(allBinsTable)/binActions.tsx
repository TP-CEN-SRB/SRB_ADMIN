"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTransition } from "react"
import { FaEdit, FaTrashRestore, FaCaretSquareDown, FaCaretSquareUp } from "react-icons/fa"
import { Trash2Icon } from "lucide-react"
import { BiSolidDoorOpen } from "react-icons/bi"
import { RiDoorFill } from "react-icons/ri"
import { toast } from "sonner"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteBin } from "./action"
import { publishMqtt } from "@/lib/mqtt"
import { ableToPublishMqttMessage, updateCommandUpdatedAt } from "@/utils/mqttPublisher"
import { Bin } from "./columns"

export function BinActions({ bin }: { bin: Bin }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

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

  function handleDelete() {
    startTransition(async function () {
      const data = await deleteBin(bin.id)
      if (data?.error) {
        toast.error(data.error)
        return
      }
      const datetime = format(new Date(), "EEEE, MMMM dd, yyyy 'at' h:mm a")
      toast.success("Bin deleted successfully", { description: `Bin deleted at ${datetime}` })
      router.push("/admin/bin")
    })
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">More</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/admin/bin/update/${bin.id}`}>
              <FaEdit className="mr-2" /> Edit Bin
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push(`/admin/bin/disposal/${bin.id}`)}>
            <FaTrashRestore className="mr-2" /> View Disposals
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
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
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                Delete Bin
              </DropdownMenuItem>
            </AlertDialogTrigger>

            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete this bin?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete bin {bin.id} and all of its disposal history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                <AlertDialogAction disabled={isPending} variant="destructive" onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
