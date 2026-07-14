"use client"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { checkedRoles } from "./constants"
import { useState } from "react"

export function SelectRole({role} : {role: string}){
    const [ newRole, setNewRole ] = useState(role)
    console.log(newRole)
    return(
        <Select defaultValue={role} onValueChange={setNewRole}>
            <SelectTrigger className="w-24">
            <SelectValue placeholder="role" />
            </SelectTrigger>
            <SelectContent position="popper">
                <SelectGroup>
                <SelectLabel>Select Role</SelectLabel>
                {checkedRoles.map((checkedRole) => (
                    <SelectItem key={checkedRole.value} value={checkedRole.value}>
                    {checkedRole.label}
                    </SelectItem>
                ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}