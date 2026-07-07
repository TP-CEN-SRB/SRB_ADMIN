"use client"
import React, { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MdDeleteForever, MdMoreVert } from "react-icons/md"
import Link from "next/link"
import { FaEdit } from "react-icons/fa"
import ConfirmDeleteRewardDialog from "../Dialog/ConfirmDeleteRewardDialog"

const RewardMore = ({ id }: { id: string }) => {
  const [isDeleteRewardDialogOpen, setDeleteRewardDialogOpen] = useState(false)
  return (
    <div>
      <ConfirmDeleteRewardDialog
        isOpen={isDeleteRewardDialogOpen}
        handleDialogOpen={() =>
          setDeleteRewardDialogOpen(!isDeleteRewardDialogOpen)
        }
        rewardId={id}
      />
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full border border-black text-xl p-2 bg-gray-50">
          <MdMoreVert />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="border-gray-300"
          side="bottom"
          align="end"
        >
          <Link href={`/admin/reward/edit/${id}`}>
            <DropdownMenuItem className="cursor-pointer">
              <FaEdit />
              <span>Edit reward</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onClick={() => setDeleteRewardDialogOpen(true)}
            className="cursor-pointer"
          >
            <MdDeleteForever />
            <span>Delete reward</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default RewardMore
