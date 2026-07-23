"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { FaEdit, FaPlus } from "react-icons/fa"
import { MdMarkEmailRead, MdOutlineBarChart } from "react-icons/md"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { deleteBinUser } from "@/lib/auth-server"

interface BinManagerActionsProps {
  binManagerId: string
  binCount: number
}

export function BinManagerActions({ binManagerId, binCount }: BinManagerActionsProps) {
  const hasBins = binCount > 0
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async function () {
      const data = await deleteBinUser(binManagerId)
      if (data?.error) {
        toast.error(data.error)
        return
      }
      toast.success("Bin Manager Deleted", {
        description: "The bin manager and all their assigned bins have been permanently deleted.",
      })
      router.push("/admin/bin/manager")
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
            <Link href={`/admin/bin/manager/update/${binManagerId}`}>
              <FaEdit className="mr-2" /> Edit Manager
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href={`/admin/bin/create/${binManagerId}`}>
              <FaPlus className="mr-2" /> Create Bin
            </Link>
          </DropdownMenuItem>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={!hasBins ? "cursor-not-allowed" : ""}>
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/bin/manager/${binManagerId}`)}
                    disabled={!hasBins}
                  >
                    <MdOutlineBarChart className="mr-2" /> View Bin Capacity
                  </DropdownMenuItem>
                </div>
              </TooltipTrigger>
              {!hasBins && (
                <TooltipContent side="left" align="start" sideOffset={10} className="max-w-xs">
                  You need to create bins before viewing their capacity.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <DropdownMenuItem asChild>
            <Link href={`/admin/bin/manager/subscription/${binManagerId}`}>
              <MdMarkEmailRead className="mr-2" /> Manage Subscriptions
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                Delete Manager
              </DropdownMenuItem>
            </AlertDialogTrigger>

            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete this bin manager?</AlertDialogTitle>
                <AlertDialogDescription>
                  {hasBins
                    ? `This manager has ${binCount} bin${binCount === 1 ? "" : "s"} linked. Deleting will permanently remove the manager and all of their bins.`
                    : "This will permanently delete this bin manager."}
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
