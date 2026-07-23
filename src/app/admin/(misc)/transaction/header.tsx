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

const limits = [
  { label: "20 rows", value: "20" },
  { label: "50 rows", value: "50" },
  { label: "100 rows", value: "100" },
]

const transactionTypes = [
  { label: "Redemption", value: "REDEMPTION" },
  { label: "Disposal", value: "DISPOSAL" },
  { label: "Quest Reward", value: "QUEST_REWARD" },
  { label: "Tree Reward", value: "TREE_REWARD" },
  { label: "Purchase", value: "PURCHASE" },
  { label: "Others", value: "OTHERS" },
]

interface TransactionHeaderProps {
  currentPage: number
  currentLimit: number
  totalPages: number
  totalCount: number
}

export function TransactionHeader({ currentPage, currentLimit, totalPages, totalCount }: TransactionHeaderProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const typeParam = searchParams.get("transactionType")
  const activeTypes = typeParam ? typeParam.split(",") : transactionTypes.map((t) => t.value)
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

  function onCheckedType(typeValue: string, isChecked: boolean) {
    let newTypes = [...activeTypes]
    if (isChecked) {
      newTypes.push(typeValue)
    } else {
      newTypes = newTypes.filter((t) => t !== typeValue)
    }
    pushParams(function (params) {
      params.set("transactionType", newTypes.join(","))
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
        All Transactions

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={currentSort === "dateDesc"}
                onCheckedChange={(checked) => onCheckedSort("dateDesc", checked)}
              >
                Newest first
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentSort === "dateAsc"}
                onCheckedChange={(checked) => onCheckedSort("dateAsc", checked)}
              >
                Oldest first
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuLabel>Type</DropdownMenuLabel>
              {transactionTypes.map(function (type) {
                return (
                  <DropdownMenuCheckboxItem
                    key={type.value}
                    checked={activeTypes.includes(type.value)}
                    onCheckedChange={function (checked) { onCheckedType(type.value, checked) }}
                    onSelect={function (event) { event.preventDefault() }}
                  >
                    {type.label}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          placeholder="search member name or email..."
          className="text-sm w-64"
          onChange={function (e) { onSearch(e.target.value) }}
        />
      </div>

      <div className="flex items-center gap-2">
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
