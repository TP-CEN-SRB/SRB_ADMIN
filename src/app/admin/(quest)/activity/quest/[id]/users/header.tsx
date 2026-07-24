"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ListFilter } from "lucide-react"

import { useTableQueryParams } from "@/hooks/useTableQueryParams"
import { TablePaginationControls } from "@/components/TablePaginationControls"

const faculties = ["ENG", "BUS", "DES", "ASC", "IIT", "HSS", "EXT", "OTHERS"]
const completionOptions = ["Completed", "Not Completed"]

interface QuestUserHeaderProps {
  currentPage: number
  currentLimit: number
  totalPages: number
  totalCount: number
}

export function QuestUserHeader({ currentPage, currentLimit, totalPages, totalCount }: QuestUserHeaderProps) {
  const { searchParams, isPending, setLimit, goToPage, toggleListParam, setSearch } =
    useTableQueryParams({ currentPage, totalPages })

  const facultyParam = searchParams.get("faculty")
  const activeFaculties = facultyParam ? facultyParam.split(",") : [...faculties]
  const completionParam = searchParams.get("completion")
  const activeCompletion = completionParam ? completionParam.split(",") : [...completionOptions]

  function onCheckedFaculty(facultyValue: string, isChecked: boolean) {
    toggleListParam("faculty", facultyValue, isChecked, activeFaculties)
  }

  function onCheckedCompletion(value: string, isChecked: boolean) {
    toggleListParam("completion", value, isChecked, activeCompletion)
  }

  function onSearch(search: string) {
    setSearch("search", search)
  }

  return (
    <header className="z-40 flex items-center justify-between bg-muted p-2">
      <div className="flex items-center gap-2">
        Users in Quest

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Completion</DropdownMenuLabel>
              {completionOptions.map(function (option) {
                return (
                  <DropdownMenuCheckboxItem
                    key={option}
                    checked={activeCompletion.includes(option)}
                    onCheckedChange={function (checked) { onCheckedCompletion(option, checked) }}
                    onSelect={function (event) { event.preventDefault() }}
                  >
                    {option}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

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
