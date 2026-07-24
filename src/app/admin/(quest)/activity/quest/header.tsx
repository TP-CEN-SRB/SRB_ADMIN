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

const sorts = [
  { label: "Title A-Z", value: "titleAsc" },
  { label: "Title Z-A", value: "titleDesc" },
  { label: "Reward Points Asc", value: "rewardAsc" },
  { label: "Reward Points Desc", value: "rewardDesc" },
  { label: "Date Asc", value: "dateAsc" },
  { label: "Date Desc", value: "dateDesc" },
]

const materials = [
  { label: "Plastic", value: "PLASTIC" },
  { label: "Metal", value: "METAL" },
  { label: "Paper", value: "PAPER" },
  { label: "E-Waste", value: "E_WASTE" },
  { label: "General", value: "GENERAL" },
]

interface QuestHeaderProps {
  currentPage: number
  currentLimit: number
  totalPages: number
  totalCount: number
}

export function QuestHeader({ currentPage, currentLimit, totalPages, totalCount }: QuestHeaderProps) {
  const { searchParams, isPending, setLimit, goToPage, setSort, toggleListParam, setSearch } =
    useTableQueryParams({ currentPage, totalPages })

  const materialParam = searchParams.get("material")
  const activeMaterials = materialParam ? materialParam.split(",") : materials.map(function (m) { return m.value })
  const currentSort = searchParams.get("sort") || "dateDesc"

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
        Active Quests

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
              <DropdownMenuLabel>Material Type</DropdownMenuLabel>
              {materials.map(function (material) {
                return (
                  <DropdownMenuCheckboxItem
                    key={material.value}
                    checked={activeMaterials.includes(material.value)}
                    onCheckedChange={function (checked) { onCheckedMaterial(material.value, checked) }}
                    onSelect={function (event) { event.preventDefault() }}
                  >
                    {material.label}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          placeholder="search title..."
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
