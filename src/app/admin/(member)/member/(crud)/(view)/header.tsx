"use client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"

import { Input } from "@/components/ui/input"

import { ListFilter } from "lucide-react"
import { Button } from "@/components/ui/button"

import { useTableQueryParams } from "@/hooks/useTableQueryParams"
import { TablePaginationControls } from "@/components/TablePaginationControls"
import { checkedRoles, checkedFaculties } from "./constants"

const filters = [
  { label: "A-Z", value: "nameAsc" },
  { label: "Z-A", value: "nameDesc" },
  { label: "Date Asc", value: "dateAsc" },
  { label: "Date Desc", value: "dateDesc" },
]

interface PaginationHeaderProps {
    currentPage: number,
    currentLimit: number,
    totalPages: number,
    allMemberCount: number
}

export function PageinationHeader({currentPage, currentLimit, totalPages, allMemberCount} : PaginationHeaderProps){

    const { searchParams, isPending, setLimit, goToPage, setSort, toggleListParam, setSearch } =
        useTableQueryParams({ currentPage, totalPages })

    const rolesParam = searchParams.get("roles")
    const facultyParam = searchParams.get("faculty")
    const activeRoles = rolesParam ? rolesParam.split(",") : ["admin", "STUDENT", "STAFF"]
    const activeFaculty = facultyParam ? facultyParam.split(",") : ["ENG", "BUS", "DES", "ASC", "IIT", "HSS", "EXT", "OTHERS"]

    const currentSort = searchParams.get("sort") || "dateDesc"

    function onCheckedRole(roleValue: string, isChecked: boolean){
        toggleListParam("roles", roleValue, isChecked, activeRoles)
    }

    function onCheckedFaculty(facultyValue: string, isChecked: boolean){
        toggleListParam("faculty", facultyValue, isChecked, activeFaculty)
    }

    function onCheckedSort(sortValue: string, isChecked: boolean){
        setSort(sortValue, isChecked)
    }

    function onEmailSearch(email: string){
        setSearch("email", email)
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

                        <DropdownMenuSeparator/>
                        
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>Faculty</DropdownMenuLabel>
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Select Faculty</DropdownMenuSubTrigger>
                                <DropdownMenuPortal>
                                    <DropdownMenuSubContent>
                                        {checkedFaculties.map((faculty)=>(
                                            <DropdownMenuCheckboxItem 
                                            key={faculty.value} 
                                            checked={activeFaculty.includes(faculty.value)} 
                                            onCheckedChange={function(checked){onCheckedFaculty(faculty.value, checked)}}
                                            onSelect={function(event) {event.preventDefault()}}
                                            >
                                                {faculty.label}
                                            </DropdownMenuCheckboxItem>
                                        ))}

                                    </DropdownMenuSubContent>
                                </DropdownMenuPortal>
                            </DropdownMenuSub>
  
                        </DropdownMenuGroup>

                    </DropdownMenuContent>
                </DropdownMenu>

                <Input placeholder="search email..." className="text-sm w-40" onChange={function(e) { onEmailSearch(e.target.value) }}/>
            </div>

            <div className="flex items-center gap-2">
                <TablePaginationControls
                    currentPage={currentPage}
                    currentLimit={currentLimit}
                    totalPages={totalPages}
                    totalCount={allMemberCount}
                    isPending={isPending}
                    onLimitChange={setLimit}
                    onPageChange={goToPage}
                />
            </div>
        </header>
    )
}