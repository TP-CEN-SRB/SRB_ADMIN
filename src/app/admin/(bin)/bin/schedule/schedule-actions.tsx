"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Pencil, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deletePowerSchedule } from "@/app/action/bin"

interface ScheduleActionsProps {
  scheduleId: string
  isDefault: boolean
}

export function ScheduleActions({ scheduleId, isDefault }: ScheduleActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async function () {
      const result = await deletePowerSchedule(scheduleId)
      if (result?.error) {
        toast.error("Error", { description: result.error })
        return
      }
      toast.success("Success", { description: result?.success })
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="outline" size="icon" asChild>
        <Link href={`/admin/bin/schedule/${scheduleId}`}>
          <Pencil className="size-4" />
        </Link>
      </Button>

      {!isDefault && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon" disabled={isPending}>
              <Trash2Icon className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this schedule?</AlertDialogTitle>
              <AlertDialogDescription>
                This bin manager&apos;s Pi will fall back to the global default
                schedule until a new one is assigned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
