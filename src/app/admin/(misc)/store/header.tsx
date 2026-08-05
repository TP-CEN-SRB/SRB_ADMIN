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
import { ListFilter, Map, PlusCircle } from "lucide-react"
import Link from "next/link"

import { useTableQueryParams } from "@/hooks/useTableQueryParams"
import { TablePaginationControls } from "@/components/TablePaginationControls"

const sorts = [
  { label: "A-Z", value: "nameAsc" },
  { label: "Z-A", value: "nameDesc" },
  { label: "Date Asc", value: "dateAsc" },
  { label: "Date Desc", value: "dateDesc" },
]

const storeFaculties = ["ENG", "BUS", "DES", "ASC", "IIT", "HSS", "EXT", "OTHERS"]

interface StoreHeaderProps {
  currentPage: number
  currentLimit: number
  totalPages: number
  totalCount: number
}

export function StoreHeader({ currentPage, currentLimit, totalPages, totalCount }: StoreHeaderProps) {
  const { searchParams, isPending, setLimit, goToPage, setSort, toggleListParam, setSearch } =
    useTableQueryParams({ currentPage, totalPages })

  const facultyParam = searchParams.get("faculty")
  const activeFaculties = facultyParam ? facultyParam.split(",") : [...storeFaculties]
  const currentSort = searchParams.get("sort") || "dateDesc"

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
        Store Accounts

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
              {storeFaculties.map(function (faculty) {
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
          placeholder="search name or email..."
          className="text-sm w-48"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={function (e) { onSearch(e.target.value) }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href="/admin/store/map">
            <Map className="mr-2 size-4" />
            Store Map
          </Link>
        </Button>

        <Button asChild size="sm">
          <Link href="/admin/store/create">
            <PlusCircle className="mr-2 size-4" />
            Create Store
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
