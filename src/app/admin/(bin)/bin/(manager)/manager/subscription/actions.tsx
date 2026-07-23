"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Trash2Icon } from "lucide-react"
import { FaEdit } from "react-icons/fa"
import { toast } from "sonner"

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
import { Button } from "@/components/ui/button"
import { Subscription } from "./columns"
import { deleteSubscription } from "@/app/action/subscription"

const Actions = ({ data }: { data: Subscription }) => {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async function () {
      const result = await deleteSubscription(data.id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Subscription deleted", { description: result.success })
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">More</Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/admin/bin/manager/subscription/edit/${data.id}`}>
              <FaEdit className="mr-2" /> Edit email
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                Delete Subscription
              </DropdownMenuItem>
            </AlertDialogTrigger>

            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete this subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will stop {data.email} from receiving bin alert emails.
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

export default Actions
