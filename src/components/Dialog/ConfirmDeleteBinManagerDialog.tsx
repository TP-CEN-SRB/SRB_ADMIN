"use client"

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
import { Button } from "../ui/button"
import CustomFormMessage from "../FormLogic/CustomFormMessage"
import { Loader2, AlertTriangle } from "lucide-react"
import { deleteBinUser } from "@/lib/auth-server"
interface DeleteBinManagerDialogProps {
  userId: string
  isOpen: boolean
  handleDialogOpen: () => void
}

const ConfirmDeleteBinManagerDialog = ({
  userId,
  isOpen,
  handleDialogOpen,
}: DeleteBinManagerDialogProps) => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const router = useRouter()
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" })

  const handleDelete = () => {
    startTransition(async () => {
      const data = await deleteBinUser(userId)
      setError(data?.error as string)
      if (!data.error && data.success !== undefined) {
        handleDialogOpen()
        toast("Bin Manager Deleted",{
          description:
            "The bin manager and all their assigned bins have been permanently deleted.",
        })
        router.push("/admin/bin/manager")
      }
    })
  }

  const WarningContent = (
    <>
      <div className="flex items-center gap-3 mb-4 text-red-600">
        <AlertTriangle className="h-6 w-6" />
        <span className="font-semibold text-lg">Warning</span>
      </div>
      <p className="text-sm text-gray-700">
        You are about to permanently delete this <strong>Bin Manager</strong> and
        all <strong>bins assigned</strong> to them.
      </p>
      <p className="text-sm text-gray-700 mt-2">
        This action <span className="font-semibold text-red-600">cannot be undone</span>.
        Are you sure you want to continue?
      </p>
    </>
  )

  // Desktop: use Dialog
  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl text-red-600">
              Delete Bin Manager
            </DialogTitle>
            <DialogDescription className="text-slate-500 mt-2 text-md">
              {WarningContent}
            </DialogDescription>
          </DialogHeader>

          {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}

          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={handleDialogOpen}
              type="button"
              className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              disabled={isPending}
              onClick={handleDelete}
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Deleting..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Mobile: use Drawer
  return (
    <Drawer open={isOpen} onOpenChange={handleDialogOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-xl text-red-600">
            Delete Bin Manager
          </DrawerTitle>
          <DrawerDescription className="text-slate-500 text-md">
            {WarningContent}
          </DrawerDescription>
        </DrawerHeader>

        {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}

        <DrawerFooter>
          <Button
            disabled={isPending}
            onClick={handleDelete}
            type="button"
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Deleting..." : "Confirm Delete"}
          </Button>
          <Button
            disabled={isPending}
            onClick={handleDialogOpen}
            type="button"
            className="border border-gray-300 text-gray-700 bg-white hover:bg-gray-100"
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ConfirmDeleteBinManagerDialog
