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
import { ListFilter, PlusCircle } from "lucide-react"
import Link from "next/link"

import { useTableQueryParams } from "@/hooks/useTableQueryParams"
import { TablePaginationControls } from "@/components/TablePaginationControls"

const sorts = [
  { label: "A-Z", value: "nameAsc" },
  { label: "Z-A", value: "nameDesc" },
  { label: "Bins Asc", value: "binsAsc" },
  { label: "Bins Desc", value: "binsDesc" },
]

const faculties = [
  { label: "ENG", value: "ENG" },
  { label: "BUS", value: "BUS" },
  { label: "DES", value: "DES" },
  { label: "ASC", value: "ASC" },
  { label: "IIT", value: "IIT" },
  { label: "HSS", value: "HSS" },
  { label: "EXT", value: "EXT" },
  { label: "OTHERS", value: "OTHERS" },
]

interface BinManagerHeaderProps {
  currentPage: number
  currentLimit: number
  totalPages: number
  totalCount: number
}

export function BinManagerHeader({ currentPage, currentLimit, totalPages, totalCount }: BinManagerHeaderProps) {
  const { searchParams, isPending, setLimit, goToPage, setSort, toggleListParam, setSearch } =
    useTableQueryParams({ currentPage, totalPages })

  const facultyParam = searchParams.get("faculty")
  const activeFaculties = facultyParam ? facultyParam.split(",") : faculties.map(function (f) { return f.value })
  const currentSort = searchParams.get("sort") || "nameAsc"

  function onCheckedFaculty(facultyValue: string, isChecked: boolean) {
    toggleListParam("faculty", facultyValue, isChecked, activeFaculties)
  }

  function onCheckedSort(sortValue: string, isChecked: boolean) {
    setSort(sortValue, isChecked)
  }

  function onSearch(search: string) {
    setSearch("search", search)
  }

  return (
    <header className="z-40 flex items-center justify-between bg-muted p-2">
      <div className="flex items-center gap-2">
        Bin Managers

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              {sorts.map(function (sort) {
                return (
                  <DropdownMenuCheckboxItem
                    key={sort.value}
                    checked={currentSort === sort.value}
                    onCheckedChange={function (checked) { onCheckedSort(sort.value, checked) }}
                  >
                    {sort.label}
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
                    key={faculty.value}
                    checked={activeFaculties.includes(faculty.value)}
                    onCheckedChange={function (checked) { onCheckedFaculty(faculty.value, checked) }}
                    onSelect={function (event) { event.preventDefault() }}
                  >
                    {faculty.label}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          placeholder="search name or email..."
          className="text-sm w-48"
          onChange={function (e) { onSearch(e.target.value) }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button asChild size="sm">
          <Link href="/admin/bin/manager/create">
            <PlusCircle className="mr-2 size-4" />
            Create Bin Manager
          </Link>
        </Button>

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
