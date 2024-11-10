"use client";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdLockReset, MdMoreVert } from "react-icons/md";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import ConfirmChangeAdminPasswordDialog from "../Dialog/ConfirmChangeAdminPasswordDialog";

const AdminProfileMore = ({ email }: { email: string }) => {
  const [isDialogOpen, setDialogOpen] = useState(false);
  return (
    <div>
      <ConfirmChangeAdminPasswordDialog
        email={email}
        isOpen={isDialogOpen}
        handleDialogOpen={() => setDialogOpen(!isDialogOpen)}
      />
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full border border-black text-xl p-2">
          <MdMoreVert />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <Link href="/admin/profile/edit">
            <DropdownMenuItem className="hover:!bg-[#f5f2b3] cursor-pointer">
              <FaEdit />
              <span>Edit profile</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem className="hover:!bg-[#f5f2b3] cursor-pointer">
            <IoIosMail />
            <span>Change email</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDialogOpen(true)}
            className="hover:!bg-[#f5f2b3] cursor-pointer"
          >
            <MdLockReset />
            <span>Reset password</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AdminProfileMore;
