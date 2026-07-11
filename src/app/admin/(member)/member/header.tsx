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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"

import { Input } from "@/components/ui/input"

import { ChevronLeft, ChevronRight, ChevronsLeft,  ChevronsRight, ListFilter} from "lucide-react"
import { Button } from "@/components/ui/button"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTransition } from "react"

const limits = [
  { label: "10 rows", value: "10" },
  { label: "20 rows", value: "20" },
  { label: "50 rows", value: "50" },
  { label: "100 rows", value: "100" },
]

const filters = [
  { label: "A-Z", value: "nameAsc" },
  { label: "Z-A", value: "nameDesc" },
  { label: "Date Asc", value: "dateAsc" },
  { label: "Date Desc", value: "dateDesc" },
]

const checkedRoles = [
    {label:"Admin", value: "ADMIN"},
    {label:"Student", value: "STUDENT"}, 
    {label:"Staff", value: "STAFF"}
]
interface PaginationHeaderProps {
    currentPage: number,
    currentLimit: number,
    totalPages: number,
    allMemberCount: number
}

export function PageinationHeader({currentPage, currentLimit, totalPages, allMemberCount} : PaginationHeaderProps){

    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams() 

    const rolesParam = searchParams.get("roles")
    const activeRoles = rolesParam ? rolesParam.split(",") : ["ADMIN", "STUDENT", "STAFF"]

    const currentSort = searchParams.get("sort") || "dateDesc"

    function rebuildURL(newLimit: string){
        const params = new URLSearchParams(searchParams.toString())
        params.set("limit", newLimit)
        params.set("page", "1")
        startTransition(function(){
            router.push(`${pathname}?${params.toString()}`)
        }) 
    }

    function onButtonClick(direction: string){
        const params = new URLSearchParams(searchParams.toString())
        let newPage = currentPage
        switch(direction){
            case "start":
                newPage = 1
                break
            case "prev":
                newPage = currentPage - 1
                break
            case "next":
                newPage = currentPage + 1
                break
            case "end":
                newPage = totalPages
                break
        }
        const clampPage = Math.max(1, Math.min(newPage, totalPages))
        params.set("page", clampPage.toString())
        startTransition(function(){
            router.push(`${pathname}?${params.toString()}`)
        }) 
    }

    function onCheckedRole(roleValue: string, isChecked: boolean){
        const params = new URLSearchParams(searchParams.toString())
        let newRoles = [...activeRoles]
        
        if (isChecked) {
            newRoles.push(roleValue)
        } else {
            newRoles = newRoles.filter(function(role) { return role !== roleValue })
        }
        params.set("roles", newRoles.join(",")) // MUST match the "roles" spelling expected by the server
        params.set("page", "1")
        startTransition(function(){
            router.push(`${pathname}?${params.toString()}`)
        }) 
    }

    function onCheckedSort(sortValue: string, isChecked: boolean){
        const params = new URLSearchParams(searchParams.toString())
        if (isChecked){
            params.set("sort", sortValue)
            params.set("page", "1")
        }
        startTransition(function(){
            router.push(`${pathname}?${params.toString()}`)
        }) 
    }

    return(
        <header className="z-40 flex items-center justify-between bg-muted p-2">

            <div className="flex items-center gap-2">
                Members Table

                <DropdownMenu >
                    
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                            <ListFilter className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                            {filters.map((filter) => (
                                <DropdownMenuCheckboxItem 
                                key={filter.value}
                                checked={currentSort === filter.value} 
                                onCheckedChange={function(checked){onCheckedSort(filter.value, checked)}}
                                >
                                    {filter.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator/>

                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Select Roles</DropdownMenuLabel>
                            {checkedRoles.map((role)=>(
                                <DropdownMenuCheckboxItem 
                                key={role.value} 
                                checked={activeRoles.includes(role.value)} 
                                onCheckedChange={function(checked){onCheckedRole(role.value, checked)}}
                                onSelect={function(event) {event.preventDefault()}}
                                >
                                    {role.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Input placeholder="search email..." className="text-sm w-40"/>
            </div>

            <div className="flex items-center gap-2">


                <Select value={currentLimit.toString()} onValueChange={rebuildURL}>
                    <SelectTrigger className="text-sm w-24 text-center">
                        <SelectValue placeholder="Select limit" />
                    </SelectTrigger>

                    <SelectContent position="popper">
                        <SelectGroup>
                        <SelectLabel>No. of Rows</SelectLabel>
                        {limits.map((limit) => (
                            <SelectItem key={limit.value} value={limit.value}>
                            {limit.label}
                            </SelectItem>
                        ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Button variant="outline" onClick={function(){onButtonClick("start")}} disabled={(currentPage < 2) || isPending}>
                    <ChevronsLeft className="h-4 w-4"/>
                </Button>

                <Button variant="outline" onClick={function(){onButtonClick("prev")}} disabled={(currentPage < 2) || isPending}>
                    <ChevronLeft className="h-4 w-4"/>
                </Button>

                <div className="text-sm w-18 text-center">{Math.min(currentPage * currentLimit, allMemberCount)} / {allMemberCount}</div>

                <Button variant="outline" onClick={function(){onButtonClick("next")}} disabled={(currentPage > (totalPages - 1)) || isPending}>
                    <ChevronRight className="h-4 w-4"/>
                </Button>

                <Button variant="outline" onClick={function(){onButtonClick("end")}} disabled={(currentPage > (totalPages - 1)) || isPending}>
                    <ChevronsRight className="h-4 w-4"/>
                </Button>

            </div>
        </header>
    )
}