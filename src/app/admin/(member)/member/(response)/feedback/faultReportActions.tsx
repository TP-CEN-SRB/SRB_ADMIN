"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, ImageIcon, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED"

const statusLabels: Record<Status, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
}

interface FaultReportActionsProps {
  id: string
  status: Status
  description: string | null
  faultImageUrl: string | null
}

export function FaultReportActions({ id, status, description, faultImageUrl }: FaultReportActionsProps) {
  const router = useRouter()
  const [showDescription, setShowDescription] = useState(false)
  const [showImage, setShowImage] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleStatusChange(newStatus: string) {
    setIsUpdating(true)
    const res = await fetch(`/api/admin/fault-reports/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    setIsUpdating(false)

    if (!res.ok) {
      toast.error("Failed to update status")
      return
    }

    toast.success("Status updated")
    router.refresh()
  }

  async function handleDelete() {
    setIsDeleting(true)
    const res = await fetch(`/api/admin/fault-reports/${id}/delete`, {
      method: "DELETE",
      credentials: "include",
    })
    setIsDeleting(false)

    if (!res.ok) {
      toast.error("Failed to delete fault report")
      return
    }

    setShowDelete(false)
    toast.success("Fault report deleted")
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-center gap-1">
        <Select value={status} disabled={status === "RESOLVED" || isUpdating} onValueChange={handleStatusChange}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue>{statusLabels[status]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {status === "OPEN" && <SelectItem value="IN_PROGRESS">In Progress</SelectItem>}
            {status !== "RESOLVED" && <SelectItem value="RESOLVED">Resolved</SelectItem>}
          </SelectContent>
        </Select>

        {description && (
          <Button variant="ghost" size="sm" onClick={() => setShowDescription(true)}>
            <Eye className="size-4" />
          </Button>
        )}

        {faultImageUrl && (
          <Button variant="ghost" size="sm" onClick={() => setShowImage(true)}>
            <ImageIcon className="size-4" />
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setShowDelete(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Dialog open={showDescription} onOpenChange={setShowDescription}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fault Description</DialogTitle>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{description}</p>
        </DialogContent>
      </Dialog>

      <Dialog open={showImage} onOpenChange={setShowImage}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Uploaded Image</DialogTitle>
          </DialogHeader>
          {faultImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={faultImageUrl} alt="Fault" className="rounded-lg w-full" />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Fault Report</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this fault report?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
