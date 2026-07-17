"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export function FeedbackActions({ id, message }: { id: string; message: string | null }) {
  const router = useRouter()
  const [showMessage, setShowMessage] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    const res = await fetch(`/api/admin/feedback/${id}`, { method: "DELETE" })
    setIsDeleting(false)

    if (!res.ok) {
      toast.error("Failed to delete feedback")
      return
    }

    setShowDelete(false)
    toast.success("Feedback deleted")
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-center gap-1">
        {message && (
          <Button variant="ghost" size="sm" onClick={() => setShowMessage(true)}>
            <Eye className="size-4" />
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

      <Dialog open={showMessage} onOpenChange={setShowMessage}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feedback Message</DialogTitle>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{message}</p>
        </DialogContent>
      </Dialog>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Feedback</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this feedback?
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
