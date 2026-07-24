import { deleteDisposalImagesForBin } from "@/app/action/disposal"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
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

interface ConfirmDownloadImagesDialogProps {
  binId: string
  count: number
  asOf: string
  isOpen: boolean
  handleDialogOpen: () => void
}

const ConfirmDownloadImagesDialog = ({
  binId,
  count,
  asOf,
  isOpen,
  handleDialogOpen,
}: ConfirmDownloadImagesDialogProps) => {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const router = useRouter()

  const triggerDownload = function(){
    const a = document.createElement("a")
    a.href = `/api/admin/bin/${binId}/images-zip?asOf=${encodeURIComponent(asOf)}`
    a.download = ""
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const handleDownloadOnly = function(){
    triggerDownload()
    handleDialogOpen()
  }

  const handleDownloadAndDelete = function(){
    triggerDownload()
    startTransition(async function(){
      const data = await deleteDisposalImagesForBin(binId, asOf)
      if ("error" in data) {
        setError(data.error as string)
        return
      }
      handleDialogOpen()
      toast.success("Images deleted", {
        description: `Deleted ${data.deletedCount} image(s) from this bin.`,
        duration: 2000,
      })
      router.refresh()
    })
  }

  const isDesktop = useMediaQuery({
    query: "(min-width: 768px)",
  })

  const description = `${count} image${count === 1 ? "" : "s"} will be downloaded as a ZIP file for this bin.`

  return isDesktop ? (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-3xl">Download images</DialogTitle>
          <DialogDescription className="text-slate-500 mt-4 text-md">
            {description}
          </DialogDescription>
        </DialogHeader>
        {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={handleDialogOpen}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={handleDownloadOnly}
            type="button"
            variant="outline"
          >
            Download Only
          </Button>
          <Button
            disabled={isPending}
            onClick={handleDownloadAndDelete}
            type="button"
            className="bg-red-500 hover:bg-red-600 text-gray-50"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            Download & Delete After
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : (
    <Drawer open={isOpen} onOpenChange={handleDialogOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle className="text-2xl">Download images</DrawerTitle>
          <DrawerDescription className="text-slate-500 text-md">
            {description}
          </DrawerDescription>
        </DrawerHeader>
        {error && <CustomFormMessage type="Error">{error}</CustomFormMessage>}
        <DrawerFooter>
          <Button
            disabled={isPending}
            onClick={handleDownloadAndDelete}
            type="button"
            className="bg-red-500 hover:bg-red-600 text-gray-50"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : ""}
            Download & Delete After
          </Button>
          <Button
            disabled={isPending}
            onClick={handleDownloadOnly}
            type="button"
            variant="outline"
          >
            Download Only
          </Button>
          <Button
            disabled={isPending}
            onClick={handleDialogOpen}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ConfirmDownloadImagesDialog
