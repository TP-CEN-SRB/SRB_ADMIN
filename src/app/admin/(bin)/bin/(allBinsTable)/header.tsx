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
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ListFilter } from "lucide-react"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import ExportCSV from "./export-csv"
import { Bin } from "./columns"

const limits = [
  { label: "10 rows", value: "10" },
  { label: "20 rows", value: "20" },
  { label: "50 rows", value: "50" },
  { label: "100 rows", value: "100" },
]

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
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const statusParam = searchParams.get("status")
  const activeStatuses = statusParam ? statusParam.split(",") : statuses.map(function (s) { return s.value })
  const materialParam = searchParams.get("material")
  const activeMaterials = materialParam ? materialParam.split(",") : materials.map(function (m) { return m.name })
  const currentSort = searchParams.get("sort") || "dateDesc"

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    startTransition(function () {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function rebuildURL(newLimit: string) {
    pushParams(function (params) {
      params.set("limit", newLimit)
      params.set("page", "1")
    })
  }

  function onButtonClick(direction: string) {
    let newPage = currentPage
    switch (direction) {
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
    pushParams(function (params) { params.set("page", clampPage.toString()) })
  }

  function onCheckedStatus(statusValue: string, isChecked: boolean) {
    let newStatuses = [...activeStatuses]
    if (isChecked) {
      newStatuses.push(statusValue)
    } else {
      newStatuses = newStatuses.filter(function (s) { return s !== statusValue })
    }
    pushParams(function (params) {
      params.set("status", newStatuses.join(","))
      params.set("page", "1")
    })
  }

  function onCheckedMaterial(materialValue: string, isChecked: boolean) {
    let newMaterials = [...activeMaterials]
    if (isChecked) {
      newMaterials.push(materialValue)
    } else {
      newMaterials = newMaterials.filter(function (m) { return m !== materialValue })
    }
    pushParams(function (params) {
      params.set("material", newMaterials.join(","))
      params.set("page", "1")
    })
  }

  function onCheckedSort(sortValue: string, isChecked: boolean) {
    if (!isChecked) return
    pushParams(function (params) {
      params.set("sort", sortValue)
      params.set("page", "1")
    })
  }

  function onSearch(search: string) {
    pushParams(function (params) {
      params.set("search", search)
      params.set("page", "1")
    })
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
        <ExportCSV data={exportData} />

        <Select value={currentLimit.toString()} onValueChange={rebuildURL}>
          <SelectTrigger className="text-sm w-24 text-center">
            <SelectValue placeholder="Select limit" />
          </SelectTrigger>

          <SelectContent position="popper">
            <SelectGroup>
              <SelectLabel>No. of Rows</SelectLabel>
              {limits.map(function (limit) {
                return (
                  <SelectItem key={limit.value} value={limit.value}>
                    {limit.label}
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={function () { onButtonClick("start") }} disabled={(currentPage < 2) || isPending}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        <Button variant="outline" onClick={function () { onButtonClick("prev") }} disabled={(currentPage < 2) || isPending}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="text-sm w-20 text-center">{Math.min(currentPage * currentLimit, totalCount)} / {totalCount}</div>

        <Button variant="outline" onClick={function () { onButtonClick("next") }} disabled={(currentPage > (totalPages - 1)) || isPending}>
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button variant="outline" onClick={function () { onButtonClick("end") }} disabled={(currentPage > (totalPages - 1)) || isPending}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
