"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { FaEdit, FaUsers } from "react-icons/fa"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
import { deleteQuest } from "@/app/action/quest"

export function QuestActions({ questId }: { questId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async function () {
      const data = await deleteQuest(questId)
      if (data?.error) {
        toast.error(data.error)
        return
      }
      const datetime = format(new Date(), "EEEE, MMMM dd, yyyy 'at' h:mm a")
      toast.success("Quest deleted successfully", { description: `Quest deleted at ${datetime}` })
      router.push("/admin/activity/quest")
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
            <Link href={`/admin/activity/quest/update/${questId}`}>
              <FaEdit className="mr-2" /> Edit Quest
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`/admin/activity/quest/${questId}/users`}>
              <FaUsers className="mr-2" /> View Users
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                Delete Quest
              </DropdownMenuItem>
            </AlertDialogTrigger>

            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete this quest?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this quest and its progress records.
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
