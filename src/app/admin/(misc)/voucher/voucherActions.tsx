"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { FaEdit } from "react-icons/fa"
import { EyeIcon, EyeOffIcon, Trash2Icon } from "lucide-react"
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
import { deleteVoucher, toggleVoucherAvailability } from "@/app/action/voucher"

export function VoucherActions({ voucherId, isAvailable }: { voucherId: string; isAvailable: boolean }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleToggleAvailability() {
    startTransition(async function () {
      const data = await toggleVoucherAvailability(voucherId, !isAvailable)
      if (data?.error) {
        toast.error(data.error)
        return
      }
      toast.success(!isAvailable ? "Voucher is now available" : "Voucher is now hidden")
      router.refresh()
    })
  }

  function handleDelete() {
    startTransition(async function () {
      const data = await deleteVoucher(voucherId)
      if (data?.error) {
        toast.error(data.error)
        return
      }
      const datetime = format(new Date(), "EEEE, MMMM dd, yyyy 'at' h:mm a")
      toast.success("Voucher deleted successfully", { description: `Deleted at ${datetime}` })
      router.push("/admin/voucher")
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
            <Link href={`/admin/voucher/update/${voucherId}`}>
              <FaEdit className="mr-2" /> Edit Voucher
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem disabled={isPending} onClick={handleToggleAvailability}>
            {isAvailable ? (
              <>
                <EyeOffIcon className="mr-2 size-4" /> Hide from members
              </>
            ) : (
              <>
                <EyeIcon className="mr-2 size-4" /> Make available
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                Delete Voucher
              </DropdownMenuItem>
            </AlertDialogTrigger>

            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <Trash2Icon />
                </AlertDialogMedia>
                <AlertDialogTitle>Delete this voucher?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this voucher and all of its redemption history.
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
