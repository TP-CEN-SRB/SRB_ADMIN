import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { PiDownloadBold } from "react-icons/pi"
import { getBinImageSnapshot } from "@/app/action/disposal"
import ConfirmDownloadImagesDialog from "./confirm-download-images-dialog"

interface DownloadImagesZipProps {
  binId: string
  imageCount: number
}

const DownloadImagesZip = ({ binId, imageCount }: DownloadImagesZipProps) => {
  const [isPending, startTransition] = useTransition()
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [snapshot, setSnapshot] = useState<{ count: number; asOf: string } | null>(null)

  const handleClick = function(){
    startTransition(async function(){
      const data = await getBinImageSnapshot(binId)
      if ("error" in data) {
        toast.error(data.error as string)
        return
      }
      if (data.count === 0) {
        toast.error("No images to download for this bin.")
        return
      }
      setSnapshot({ count: data.count, asOf: data.asOf as string })
      setDialogOpen(true)
    })
  }

  return (
    <>
      <Button
        variant="outline"
        disabled={imageCount === 0 || isPending}
        onClick={handleClick}
        className="flex items-center gap-x-1 text-sm"
      >
        {isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <PiDownloadBold />}
        Download Images (ZIP)
      </Button>

      {snapshot && (
        <ConfirmDownloadImagesDialog
          binId={binId}
          count={snapshot.count}
          asOf={snapshot.asOf}
          isOpen={isDialogOpen}
          handleDialogOpen={() => setDialogOpen((prev) => !prev)}
        />
      )}
    </>
  )
}

export default DownloadImagesZip
