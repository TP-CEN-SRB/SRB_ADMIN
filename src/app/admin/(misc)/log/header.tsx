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

const sources = [
  { label: "Bin Commands", value: "BIN_COMMAND" },
  { label: "App Errors", value: "APP_ERROR" },
]

interface LogHeaderProps {
  currentPage: number
  currentLimit: number
  totalPages: number
  totalCount: number
}

export function LogHeader({ currentPage, currentLimit, totalPages, totalCount }: LogHeaderProps) {
  const { searchParams, isPending, setLimit, goToPage, toggleListParam, setSearch } =
    useTableQueryParams({ currentPage, totalPages })

  const sourceParam = searchParams.get("source")
  const activeSources = sourceParam ? sourceParam.split(",") : sources.map((s) => s.value)

  function onCheckedSource(sourceValue: string, isChecked: boolean) {
    toggleListParam("source", sourceValue, isChecked, activeSources)
  }

  function onSearch(search: string) {
    setSearch("search", search)
  }

  return (
    <header className="z-40 flex items-center justify-between bg-muted p-2">
      <div className="flex items-center gap-2">
        Activity Log

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <ListFilter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Source</DropdownMenuLabel>
              {sources.map(function (source) {
                return (
                  <DropdownMenuCheckboxItem
                    key={source.value}
                    checked={activeSources.includes(source.value)}
                    onCheckedChange={function (checked) { onCheckedSource(source.value, checked) }}
                    onSelect={function (event) { event.preventDefault() }}
                  >
                    {source.label}
                  </DropdownMenuCheckboxItem>
                )
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          placeholder="search messages..."
          className="text-sm w-56"
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
