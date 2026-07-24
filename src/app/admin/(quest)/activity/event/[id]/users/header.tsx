"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ListFilter } from "lucide-react"

import { useTableQueryParams } from "@/hooks/useTableQueryParams"
import { TablePaginationControls } from "@/components/TablePaginationControls"

const faculties = ["ENG", "BUS", "DES", "ASC", "IIT", "HSS", "EXT", "OTHERS"]

interface EventUserHeaderProps {
  currentPage: number
  currentLimit: number
  totalPages: number
  totalCount: number
}

export function EventUserHeader({ currentPage, currentLimit, totalPages, totalCount }: EventUserHeaderProps) {
  const { searchParams, isPending, setLimit, goToPage, toggleListParam, setSearch } =
    useTableQueryParams({ currentPage, totalPages })

  const facultyParam = searchParams.get("faculty")
  const activeFaculties = facultyParam ? facultyParam.split(",") : [...faculties]

  function onCheckedFaculty(facultyValue: string, isChecked: boolean) {
    toggleListParam("faculty", facultyValue, isChecked, activeFaculties)
  }

  function onSearch(search: string) {
    setSearch("search", search)
  }

  return (
    <header className="z-40 flex items-center justify-between bg-muted p-2">
      <div className="flex items-center gap-2">
        Users in Event

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Faculty</DropdownMenuLabel>
              {faculties.map(function (faculty) {
                return (
                  <DropdownMenuCheckboxItem
                    key={faculty}
                    checked={activeFaculties.includes(faculty)}
                    onCheckedChange={function (checked) { onCheckedFaculty(faculty, checked) }}
                    onSelect={function (event) { event.preventDefault() }}
                  >
                    {faculty}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          placeholder="search name..."
          className="text-sm w-48"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={function (e) { onSearch(e.target.value) }}
        />
      </div>

      <div className="flex items-center gap-2">
        <TablePaginationControls
          currentPage={currentPage}
          currentLimit={currentLimit}
          totalPages={totalPages}
          totalCount={totalCount}
          isPending={isPending}
          onLimitChange={setLimit}
          onPageChange={goToPage}
        />
      </div>
    </header>
  )
}
