"use client"

import { deleteQuestTemplate } from "@/app/action/questTemplate"
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

interface Props {
  templateId: string
  isOpen: boolean
  handleDialogOpen: () => void
}

export default function ConfirmDeleteQuestTemplateDialog({
  templateId,
  isOpen,
  handleDialogOpen,
}: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const router = useRouter()
  const datetime = formatDateTime(new Date())

  const handleDelete = () => {
    startTransition(async () => {
      const data = await deleteQuestTemplate(templateId)
      setError(data?.error as string)

      if (!data.error && data.success !== undefined) {
        handleDialogOpen()

        toast("Template deleted successfully",{
          description: (
            <div>
              Template deleted at {datetime}
              <br />
              <br />
              <strong>Template ID: </strong> {templateId}
            </div>
          ),
          duration: 2000,
        })

        router.push("/admin/quest-template")
      }
    })
  }

  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" })

  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-3xl">Are you sure?</DialogTitle>
          <DialogDescription className="text-slate-500 mt-4 text-md">
            You are about to delete quest template {templateId}
          </DialogDescription>
        </DialogHeader>

        {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}

        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={handleDialogOpen}
            className="border border-red-500 bg-gray-50 text-red-500 hover:bg-gray-200"
          >
            Cancel
          </Button>

          <Button
            disabled={isPending}
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-gray-50"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Loading..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={isOpen} onOpenChange={handleDialogOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-2xl">Are you sure?</DrawerTitle>
          <DrawerDescription className="text-slate-500 text-md">
            You are about to delete quest template {templateId}
          </DrawerDescription>
        </DrawerHeader>

        {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}

        <DrawerFooter>
          <Button
            disabled={isPending}
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-gray-50"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Loading..." : "Confirm"}
          </Button>

          <Button
            disabled={isPending}
            onClick={handleDialogOpen}
            className="border border-red-500 bg-gray-50 text-red-500 hover:bg-gray-200"
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
