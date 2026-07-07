"use client"


import { Button } from "@/components/ui/button"
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FaFilter } from "react-icons/fa"

type Checked = DropdownMenuCheckboxItemProps["checked"]

interface EventUserFilterDropdownProps {
  selectedFaculties: string[]
  onChange: (filter: { faculty: string[] }) => void
}

const allFaculties = ["ENG", "DES", "IIT", "BUS"]

const EventUserFilterDropdown = ({
  selectedFaculties,
  onChange,
}: EventUserFilterDropdownProps) => {
  const handleToggle = (value: string, checked: boolean) => {
    const updated = [...selectedFaculties]

    if (checked) {
      updated.push(value)
    } else {
      const index = updated.indexOf(value)
      if (index > -1) updated.splice(index, 1)
    }

    onChange({ faculty: updated })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FaFilter /> Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>Faculty</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {allFaculties.map((f) => (
          <DropdownMenuCheckboxItem
            key={f}
            checked={selectedFaculties.includes(f)}
            onCheckedChange={(checked) => handleToggle(f, Boolean(checked))}
          >
            {f}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default EventUserFilterDropdown
