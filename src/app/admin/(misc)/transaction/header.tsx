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
  const { searchParams, isPending, setLimit, goToPage, toggleListParam, setSearch, pushParams } =
    useTableQueryParams({ currentPage, totalPages })

  const typeParam = searchParams.get("transactionType")
  const activeTypes = typeParam ? typeParam.split(",") : transactionTypes.map((t) => t.value)
  const currentSort = searchParams.get("sort") || "dateDesc"

  function onCheckedType(typeValue: string, isChecked: boolean) {
    toggleListParam("transactionType", typeValue, isChecked, activeTypes)
  }

  function onCheckedSort(sortValue: string, isChecked: boolean) {
    if (!isChecked) return
    pushParams(function (params) {
      params.set("sort", sortValue)
      params.set("page", "1")
    })
  }

  function onSearch(search: string) {
    setSearch("search", search)
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
