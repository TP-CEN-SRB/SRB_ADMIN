"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MdDeleteForever, MdMoreVert } from "react-icons/md";
import Link from "next/link";
import { FaEdit } from "react-icons/fa";

const RewardMore = ({ id }: { id: string }) => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full border border-black text-xl p-2">
          <MdMoreVert />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="end">
          <Link href={`/admin/reward/edit/${id}`}>
            <DropdownMenuItem className="cursor-pointer">
              <FaEdit />
              <span>Edit reward</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            // onClick={() => setDeleteUserDialogOpen(true)}
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

export default RewardMore;
