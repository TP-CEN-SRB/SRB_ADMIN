"use client"
import React, { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MdLockReset, MdMoreVert } from "react-icons/md"
import Link from "next/link"
import { FaEdit } from "react-icons/fa"
import { IoIosMail } from "react-icons/io"
import ConfirmChangeAdminPasswordDialog from "../Dialog/ConfirmChangeAdminPasswordDialog"
import EditAdminEmailDialog from "@/components/Dialog/EditAdminEmailDialog"

const AdminProfileMore = ({ email }: { email: string }) => {
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [isEmailDialogOpen, setEmailDialogOpen] = useState(false)
  return (
    <div>
      <ConfirmChangeAdminPasswordDialog
        email={email}
        isOpen={isPasswordDialogOpen}
        handleDialogOpen={() => setPasswordDialogOpen(!isPasswordDialogOpen)}
      />
      <EditAdminEmailDialog
        isOpen={isEmailDialogOpen}
        handleDialogOpen={() => setEmailDialogOpen(!isEmailDialogOpen)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full border border-black text-xl p-2">
          <MdMoreVert />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="border-gray-300"
          side="bottom"
          align="end"
        >
          <Link href="/admin/profile/edit">
            <DropdownMenuItem className="cursor-pointer">
              <FaEdit />
              <span>Edit profile</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onClick={() => setEmailDialogOpen(true)}
            className="cursor-pointer"
          >
            <IoIosMail />
            <span>Change email</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setPasswordDialogOpen(true)}
            className="cursor-pointer"
          >
            <MdLockReset />
            <span>Reset password</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default AdminProfileMore
