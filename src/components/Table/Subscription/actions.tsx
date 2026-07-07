import React, { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Subscription } from "@/components/Table/Subscription/columns"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import { MdDeleteForever } from "react-icons/md"
import { useRouter } from "next/navigation"
import { FaEdit } from "react-icons/fa"
import ConfirmDeleteSubscriptionDialog from "@/components/Dialog/ConfirmDeleteSubscriptionDialog"

const Actions = ({ data }: { data: Subscription }) => {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()
  return (
    <div>
      <ConfirmDeleteSubscriptionDialog
        isOpen={isDialogOpen}
        handleDialogOpen={() => setDialogOpen(!isDialogOpen)}
        subscriptionId={data.id}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="hover:bg-gray-300 h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() =>
              router.push(`/admin/bin/manager/subscription/edit/${data.id}`)
            }
          >
            <FaEdit />
            Edit email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <MdDeleteForever /> Delete Subscription
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Actions
