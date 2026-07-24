"use client"

import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { ListFilter, Undo2 } from "lucide-react"

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

interface MemberTransactionHeaderProps {
  memberId: string
  memberName: string
  currentPage: number
  currentLimit: number
  totalPages: number
  totalCount: number
}

export function MemberTransactionHeader({
  memberId,
  memberName,
  currentPage,
  currentLimit,
  totalPages,
  totalCount,
}: MemberTransactionHeaderProps) {
  const { searchParams, isPending, setLimit, goToPage, toggleListParam, pushParams } =
    useTableQueryParams({ currentPage, totalPages })

  const typeParam = searchParams.get("transactionType")
  const activeTypes = typeParam ? typeParam.split(",") : transactionTypes.map((t) => t.value)
  const currentSort = searchParams.get("sortOrder") || "desc"

  function onCheckedType(typeValue: string, isChecked: boolean) {
    toggleListParam("transactionType", typeValue, isChecked, activeTypes)
  }

  function onCheckedSort(sortValue: string, isChecked: boolean) {
    if (!isChecked) return
    pushParams(function (params) {
      params.set("sortOrder", sortValue)
      params.set("page", "1")
    })
  }

  return (
    <header className="z-40 flex items-center justify-between bg-muted p-2">
      <div className="flex items-center gap-2">
        Transactions for {memberName}

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
                checked={currentSort === "desc"}
                onCheckedChange={(checked) => onCheckedSort("desc", checked)}
              >
                Newest first
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={currentSort === "asc"}
                onCheckedChange={(checked) => onCheckedSort("asc", checked)}
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
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/member/${memberId}`}>
            <Undo2 className="mr-2 size-4" />
            Return to Profile
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
