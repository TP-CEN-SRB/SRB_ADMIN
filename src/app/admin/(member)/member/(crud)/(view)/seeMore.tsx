"use client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

import { Trash2Icon } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import { deleteMember } from "./allMembers"

import { toast } from "sonner"
import { format } from "date-fns"

const see_more = [
  {label: "View Profile", value: "/admin/member"},
  {label: "Edit Profile", value: "/admin/member/edit"},
]

interface MemberIdProp {
    memberId: string,
    memberName: string,
    memberEmail: string
} 

export function SeeMore({memberId, memberName, memberEmail}: MemberIdProp){
    return(
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
        <Button variant="outline">More</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
        <DropdownMenuGroup>
            {see_more.map((more) => (
            <DropdownMenuItem key={more.value} asChild>
                <Link href={`${more.value}/${memberId}`}>
                {more.label}
                </Link>
            </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>

        <DropdownMenuGroup>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                    Delete
                </DropdownMenuItem>
                
                </AlertDialogTrigger>
                
                <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                    <Trash2Icon />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete {memberName}?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This will permanently delete all data for this user.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={async()=>{
                        const currentDate = format(new Date(), "EEEE, MMMM dd, yyyy 'at' h:mm a")
                        toast.error(`${memberName} has been deleted`, {description: currentDate})
                        await deleteMember(memberId)}}
                    >
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
