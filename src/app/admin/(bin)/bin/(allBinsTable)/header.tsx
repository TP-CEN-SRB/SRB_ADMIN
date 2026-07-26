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
import { ListFilter, Clock } from "lucide-react"
import Link from "next/link"

import ExportCSV from "./export-csv"
import { Bin } from "./columns"
import { useTableQueryParams } from "@/hooks/useTableQueryParams"
import { TablePaginationControls } from "@/components/TablePaginationControls"

const sorts = [
  { label: "A-Z", value: "nameAsc" },
  { label: "Z-A", value: "nameDesc" },
  { label: "Capacity Asc", value: "capacityAsc" },
  { label: "Capacity Desc", value: "capacityDesc" },
  { label: "Date Asc", value: "dateAsc" },
  { label: "Date Desc", value: "dateDesc" },
]

const statuses = [
  { label: "Functional", value: "FUNCTIONAL" },
  { label: "Under Maintenance", value: "UNDER_MAINTENANCE" },
]

interface BinHeaderProps {
  currentPage: number
  currentLimit: number
  totalPages: number
  totalCount: number
  materials: { name: string; id: string }[]
  exportData: Bin[]
}

export function BinHeader({ currentPage, currentLimit, totalPages, totalCount, materials, exportData }: BinHeaderProps) {
  const { searchParams, isPending, setLimit, goToPage, setSort, toggleListParam, setSearch } =
    useTableQueryParams({ currentPage, totalPages })

  const statusParam = searchParams.get("status")
  const activeStatuses = statusParam ? statusParam.split(",") : statuses.map(function (s) { return s.value })
  const materialParam = searchParams.get("material")
  const activeMaterials = materialParam ? materialParam.split(",") : materials.map(function (m) { return m.name })
  const currentSort = searchParams.get("sort") || "dateDesc"

  function onCheckedStatus(statusValue: string, isChecked: boolean) {
    toggleListParam("status", statusValue, isChecked, activeStatuses)
  }

  function onCheckedMaterial(materialValue: string, isChecked: boolean) {
    toggleListParam("material", materialValue, isChecked, activeMaterials)
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
        Bins

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
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {statuses.map(function (status) {
                return (
                  <DropdownMenuCheckboxItem
                    key={status.value}
                    checked={activeStatuses.includes(status.value)}
                    onCheckedChange={function (checked) { onCheckedStatus(status.value, checked) }}
                    onSelect={function (event) { event.preventDefault() }}
                  >
                    {status.label}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel>Material</DropdownMenuLabel>
              {materials.map(function (material) {
                return (
                  <DropdownMenuCheckboxItem
                    key={material.id}
                    checked={activeMaterials.includes(material.name)}
                    onCheckedChange={function (checked) { onCheckedMaterial(material.name, checked) }}
                    onSelect={function (event) { event.preventDefault() }}
                  >
                    {material.name}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          placeholder="search name or location..."
          className="text-sm w-56"
          onChange={function (e) { onSearch(e.target.value) }}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/bin/schedule">
            <Clock className="mr-2 size-4" />
            Power Schedule
          </Link>
        </Button>

        <ExportCSV data={exportData} />

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
