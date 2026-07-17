import { Button } from "@/components/ui/button"
import React, { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { LuSettings2 } from "react-icons/lu"
import { FaCheck, FaPlusCircle } from "react-icons/fa"
import { RxCross1 } from "react-icons/rx"
import { FaCircleDot } from "react-icons/fa6"
import { Faculty } from "@/generated/prisma"
import { useSearchParams } from "next/navigation"

interface TableFilterProps {
  onApplyFilter: (filters: Record<string, string[]>) => void
  onResetFilter: () => void
}
const TableFilter = ({ onApplyFilter, onResetFilter }: TableFilterProps) => {
  const [filterOpen, setFilterOpen] = useState(false)
  const searchParams = useSearchParams()
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({
    emailType: (searchParams.get("emailType")?.split(",") as string[]) || [],
    faculty: (searchParams.get("faculty")?.split(",") as string[]) || [],
  })

  const handleCheckboxChange = (group: string, value: string) => {
    setSelectedFilters((prev) => {
      const updatedGroup = prev[group]?.includes(value)
        ? prev[group].filter((item) => item !== value)
        : [...(prev[group] || []), value]
      return { ...prev, [group]: updatedGroup }
    })
  }

  const handleResetFilter = () => {
    setSelectedFilters({ emailType: [], faculty: [] })
    onResetFilter()
    setFilterOpen(false)
  }

  const handleApplyFilter = () => {
    onApplyFilter(selectedFilters)
    setFilterOpen(false)
  }
  return (
    <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
      <DropdownMenuTrigger className="bg-emerald-600 hover:bg-emerald-700 rounded-lg p-2 text-gray-50 flex items-center gap-x-2 text-sm">
        <LuSettings2 /> Filter
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuLabel>Email type</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full" variant="outline">
                <FaPlusCircle className="h-4 w-4 opacity-50" />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-52">
              <DropdownMenuCheckboxItem
                onSelect={(e) => e.preventDefault()}
                checked={selectedFilters.emailType.includes("verified")}
                onCheckedChange={() =>
                  handleCheckboxChange("emailType", "verified")
                }
                className="flex gap-x-1"
              >
                <FaCircleDot size={10} className="text-green-500" />
                Verified
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                onSelect={(e) => e.preventDefault()}
                checked={selectedFilters.emailType.includes("non-verified")}
                onCheckedChange={() =>
                  handleCheckboxChange("emailType", "non-verified")
                }
                className="flex gap-x-1"
              >
                <FaCircleDot size={10} className="text-red-600" />
                Non-verified
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mt-3" />
        <DropdownMenuLabel>Faculty</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full" variant="outline">
                <FaPlusCircle className="h-4 w-4 opacity-50" />
                Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-52">
              {Object.values(Faculty).map((item, index) => (
                <DropdownMenuCheckboxItem
                  onSelect={(e) => e.preventDefault()}
                  checked={selectedFilters.faculty.includes(item)}
                  onCheckedChange={() => handleCheckboxChange("faculty", item)}
                  key={index}
                  className="flex"
                >
                  {item}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup className="flex gap-x-3">
          <Button
            onClick={handleResetFilter}
            className="flex-1 border border-slate-800"
            variant="ghost"
          >
            <RxCross1 />
            Reset
          </Button>
          <Button
            onClick={handleApplyFilter}
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

export default TableFilter
