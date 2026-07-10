import React, { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Student } from "@/components/Table/Student/columns"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"
import ConfirmDeleteStudentDialog from "../../Dialog/ConfirmDeleteStudentDialog"
import { FaCopy } from "react-icons/fa"
import { FaEye } from "react-icons/fa"
import { IoReceipt } from "react-icons/io5"
import { MdDeleteForever } from "react-icons/md"
import { useRouter } from "next/navigation"

const Actions = ({ data }: { data: Student }) => {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()
  return (
    <div>
      <ConfirmDeleteStudentDialog
        isOpen={isDialogOpen}
        handleDialogOpen={() => setDialogOpen(!isDialogOpen)}
        userId={data.id}
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
          {data.email.endsWith("@student.tp.edu.sg") && (
            <>
              <DropdownMenuItem
                onClick={() =>
                  navigator.clipboard.writeText(data.email.split("@")[0])
                }
              >
                <FaCopy />
                Copy admin number
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={() => router.push(`/admin/member/${data.id}`)}
          >
            <FaEye />
            View student profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            <MdDeleteForever /> Delete student
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push(`/admin/member/transaction/${data.id}`)}
          >
            <IoReceipt /> View transactions
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default Actions
