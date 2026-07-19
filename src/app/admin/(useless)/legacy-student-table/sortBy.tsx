import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import { TbArrowsSort } from "react-icons/tb"
import { HiSortAscending, HiSortDescending } from "react-icons/hi"
import { FaCheck } from "react-icons/fa"
import { RxCross1 } from "react-icons/rx"
import { useSearchParams } from "next/navigation"

interface SortByFilterProps {
  onApplySortBy: (sortItem: string, sortOrder: string) => void
  onResetSortBy: () => void
}
const SortByFilter = ({ onApplySortBy, onResetSortBy }: SortByFilterProps) => {
  const [filterOpen, setFilterOpen] = useState(false)
  const searchParams = useSearchParams()
  const [sortType, setSortType] = useState(
    searchParams.get("sortItem") + "-" + searchParams.get("sortOrder")
  )

  const handleResetSortBy = function(){
    setSortType("")
    onResetSortBy()
    setFilterOpen(false)
  }

  const handleApplySortBy = function(){
    const [sortItem, sortOrder] = sortType.split("-")
    onApplySortBy(sortItem, sortOrder)
    setFilterOpen(false)
  }
  return (
    <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
      <DropdownMenuTrigger className="bg-emerald-600 hover:bg-emerald-700 rounded-lg p-2 text-gray-50 flex items-center gap-x-1 text-sm">
        <TbArrowsSort /> Sort by
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuLabel>Points</DropdownMenuLabel>

        <DropdownMenuRadioGroup value={sortType} onValueChange={setSortType}>
          <DropdownMenuRadioItem
            onSelect={(e) => e.preventDefault()}
            value="point-asc"
          >
            <HiSortAscending />
            Ascending
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            onSelect={(e) => e.preventDefault()}
            value="point-desc"
          >
            <HiSortDescending />
            Descending
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Disposals</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sortType} onValueChange={setSortType}>
          <DropdownMenuRadioItem
            onSelect={(e) => e.preventDefault()}
            value="disposal-asc"
          >
            <HiSortAscending />
            Ascending
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            onSelect={(e) => e.preventDefault()}
            value="disposal-desc"
          >
            <HiSortDescending />
            Descending
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Redemptions</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={sortType} onValueChange={setSortType}>
          <DropdownMenuRadioItem
            onSelect={(e) => e.preventDefault()}
            value="redemption-asc"
          >
            <HiSortAscending />
            Ascending
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            onSelect={(e) => e.preventDefault()}
            value="redemption-desc"
          >
            <HiSortDescending />
            Descending
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="flex gap-x-3">
          <Button
            onClick={handleResetSortBy}
            className="flex-1 border border-slate-800"
            variant="ghost"
          >
            <RxCross1 />
            Reset
          </Button>
          <Button
            onClick={handleApplySortBy}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            <FaCheck />
            Apply
          </Button>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default SortByFilter
