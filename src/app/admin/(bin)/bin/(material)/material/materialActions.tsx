"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { FaEdit } from "react-icons/fa"
import { Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
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
import { deleteBinMaterial } from "./action"

export function MaterialActions({ materialId, hasBins }: { materialId: string; hasBins: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async function () {
      const data = await deleteBinMaterial(materialId)
      if (data?.error) {
        toast.error(data.error)
        return
      }
      const datetime = format(new Date(), "EEEE, MMMM dd, yyyy 'at' h:mm a")
      toast.success("Material deleted successfully", { description: `Material deleted at ${datetime}` })
      router.push("/admin/bin/material")
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
            <Link href={`/admin/bin/material/update/${materialId}`}>
              <FaEdit className="mr-2" /> Edit Material
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={hasBins ? "cursor-not-allowed" : ""}>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem
                        variant="destructive"
                        disabled={hasBins}
                        onSelect={(e) => e.preventDefault()}
                      >
                        Delete Material
                      </DropdownMenuItem>
                    </AlertDialogTrigger>

                    <AlertDialogContent size="sm">
                      <AlertDialogHeader>
                        <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                          <Trash2Icon />
                        </AlertDialogMedia>
                        <AlertDialogTitle>Delete this material?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this bin material type.
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
                </div>
              </TooltipTrigger>
              {hasBins && (
                <TooltipContent side="left" align="start" sideOffset={10} className="max-w-xs">
                  This material type is in use. Deleting is not allowed.
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
