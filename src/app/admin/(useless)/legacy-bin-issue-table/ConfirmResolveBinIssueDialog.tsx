import { updateBinStatus } from './action'
import { toast } from 'sonner'
import { formatDateTime } from '@/utils/dateFilter'
import { BinStatus } from '@/generated/prisma'
import React, { useState, useTransition } from 'react'
import { useMediaQuery } from 'react-responsive'
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
import CustomFormMessage from '@/components/FormLogic/CustomFormMessage'
import { Button } from '@/components/ui/button'
import { Loader2, Router } from 'lucide-react'

interface ConfirmResolveBinIssueDialog {
  binId: string
  isOpen: boolean
  handleDialogOpen: () => void
  isResolved: boolean
  handleResolved: () => void
}

const ConfirmResolveBinIssueDialog = ({binId, isOpen, handleDialogOpen, isResolved, handleResolved}: ConfirmResolveBinIssueDialog) => {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const datetime = formatDateTime(new Date())
    const handleUpdateBinStatus = function(){
    startTransition(async function(){
      const data = await updateBinStatus(binId, BinStatus.FUNCTIONAL)
      setError(data?.error as string)
      setSuccess(data?.success as string)
      if (!error && success !== undefined) {
        handleDialogOpen()
        handleResolved()
        toast("Bin status updated successfully",{
          description: (
            <div>
              Bin status updated at {datetime}
              <br />
              <br />
              <strong>Bin ID: </strong> {binId}
            </div>
          ),
          duration: 2000,
        })
      }
      else{
        toast("Bin status update failed",{
          description: (
            <div>
              Bin status updated at {datetime}
              <br />
              <br />
              <strong>Bin ID: </strong> {binId}
            </div>
          ),
          duration: 2000,
        })
      }
    })
  }
  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  })
  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-3xl">Are you sure?</DialogTitle>
          <DialogDescription className="text-slate-500 mt-4 text-md">
            Update bin {binId} status to Functional?
          </DialogDescription>
        </DialogHeader>
        {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={handleDialogOpen}
            type="button"
            className="border border-green-500 bg-gray-50 text-green-500 hover:bg-gray-200"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={handleUpdateBinStatus}
            type="button"
            className="bg-green-400 hover:bg-green-500 text-gray-50"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (<Drawer open={isOpen} onOpenChange={handleDialogOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-2xl">Are you sure?</DrawerTitle>
          <DrawerDescription className="text-slate-500 text-md">
            Update bin {binId} status to Functional?
          </DrawerDescription>
        </DrawerHeader>
        {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
        <DrawerFooter>
          <Button
            disabled={isPending}
            onClick={handleUpdateBinStatus}
            type="button"
            className="bg-green-500 hover:bg-green-600 text-gray-50"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            {isPending ? "Loading..." : "Confirm"}
          </Button>
          <Button
            disabled={isPending}
            onClick={handleDialogOpen}
            type="button"
            className="border border-green-400 bg-gray-50 text-green-500 hover:bg-gray-200"
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>)
}

export default ConfirmResolveBinIssueDialog
