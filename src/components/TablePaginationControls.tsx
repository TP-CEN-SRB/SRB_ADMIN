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
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

const limits = [
  { label: "10 rows", value: "10" },
  { label: "20 rows", value: "20" },
  { label: "50 rows", value: "50" },
  { label: "100 rows", value: "100" },
]

interface TablePaginationControlsProps {
  currentPage: number
  currentLimit: number
  totalPages: number
  totalCount: number
  isPending: boolean
  onLimitChange: (newLimit: string) => void
  onPageChange: (direction: "start" | "prev" | "next" | "end") => void
}

// Rows-per-page select + start/prev/next/end pagination, shared by every
// admin data-table header (bins, bin managers, materials, members).
export function TablePaginationControls({
  currentPage,
  currentLimit,
  totalPages,
  totalCount,
  isPending,
  onLimitChange,
  onPageChange,
}: TablePaginationControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Select value={currentLimit.toString()} onValueChange={onLimitChange}>
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

      <Button variant="outline" onClick={function () { onPageChange("start") }} disabled={(currentPage < 2) || isPending}>
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      <Button variant="outline" onClick={function () { onPageChange("prev") }} disabled={(currentPage < 2) || isPending}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="text-sm w-20 text-center">{Math.min(currentPage * currentLimit, totalCount)} / {totalCount}</div>

      <Button variant="outline" onClick={function () { onPageChange("next") }} disabled={(currentPage > (totalPages - 1)) || isPending}>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button variant="outline" onClick={function () { onPageChange("end") }} disabled={(currentPage > (totalPages - 1)) || isPending}>
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
