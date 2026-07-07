"use client"

import { deleteEvent } from "@/app/action/event"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import React, { useState, useTransition } from "react"
import { useMediaQuery } from "react-responsive"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import CustomFormMessage from "@/components/FormLogic/CustomFormMessage"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { formatDateTime } from "@/utils/dateFilter"

interface ConfirmDeleteEventDialogProps {
  eventId: string
  isOpen: boolean
  handleDialogOpen: () => void
}

const ConfirmDeleteEventDialog = ({
  eventId,
  isOpen,
  handleDialogOpen,
}: ConfirmDeleteEventDialogProps) => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const router = useRouter()
  const datetime = formatDateTime(new Date())
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" })

  const handleDelete = () => {
    startTransition(async () => {
      const data = await deleteEvent(eventId)
      setError(data?.error as string)
      if (!data.error && data.success !== undefined) {
        handleDialogOpen()
        toast("Event deleted successfully",{
          description: (
            <div>
              Event deleted at {datetime}
              <br />
              <br />
              <strong>Event ID: </strong> {eventId}
            </div>
          ),
          duration: 2000,

        })
        router.push("/admin/event")
      }
    })
  }

  const title = "Are you sure?"
  const description = `You are about to delete event ${eventId}`

  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-3xl">{title}</DialogTitle>
          <DialogDescription className="text-slate-500 mt-4 text-md">
            {description}
          </DialogDescription>
        </DialogHeader>
        {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={handleDialogOpen}
            className="border border-red-500 bg-gray-50 text-red-500 hover:bg-gray-200"
            type="button"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-gray-50"
            type="button"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isPending ? "Loading..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={isOpen} onOpenChange={handleDialogOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-2xl">{title}</DrawerTitle>
          <DrawerDescription className="text-slate-500 text-md">
            {description}
          </DrawerDescription>
        </DrawerHeader>
        {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
        <DrawerFooter>
          <Button
            disabled={isPending}
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-gray-50"
            type="button"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isPending ? "Loading..." : "Confirm"}
          </Button>
          <Button
            disabled={isPending}
            onClick={handleDialogOpen}
            className="border border-red-500 bg-gray-50 text-red-500 hover:bg-gray-200"
            type="button"
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ConfirmDeleteEventDialog
