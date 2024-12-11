"use client";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdDeleteForever, MdMoreVert } from "react-icons/md";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";
import ConfirmDeleteUserDialog from "@/components/Dialog/ConfirmDeleteUserDialog";

const UserProfileMore = ({ id }: { id: string }) => {
  const [isDeleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  return (
    <div>
      <ConfirmDeleteUserDialog
        isOpen={isDeleteUserDialogOpen}
        handleDialogOpen={() =>
          setDeleteUserDialogOpen(!isDeleteUserDialogOpen)
        }
        userId={id}
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
          <Link href={`/admin/user/edit/${id}`}>
            <DropdownMenuItem className="cursor-pointer">
              <FaEdit />
              <span>Edit profile</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onClick={() => setDeleteUserDialogOpen(true)}
            className="cursor-pointer"
          >
            <MdDeleteForever />
            <span>Delete user</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfileMore;
