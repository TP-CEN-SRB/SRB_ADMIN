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
import ConfirmDeleteStudentDialog from "@/components/Dialog/ConfirmDeleteStudentDialog";

const UserProfileMore = ({ id }: { id: string }) => {
  const [isDeleteUserDialogOpen, setDeleteUserDialogOpen] = useState(false);
  return (
    <div>
      <ConfirmDeleteStudentDialog
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
          <Link href={`/admin/student/edit/${id}`}>
            <DropdownMenuItem className="cursor-pointer">
              <FaEdit />
              <span>Edit student</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onClick={() => setDeleteUserDialogOpen(true)}
            className="cursor-pointer"
          >
            <MdDeleteForever />
            <span>Delete student</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserProfileMore;
