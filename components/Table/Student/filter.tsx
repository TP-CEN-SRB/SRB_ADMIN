import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { LuSettings2 } from "react-icons/lu";
import { FaCheck } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import { FaCircleDot } from "react-icons/fa6";
import { Faculty } from "@prisma/client";

interface TableFilterProps {
  onApplyFilter: (sortItem: string, sortOrder: string) => void;
  onResetFilter: () => void;
}
const TableFilter = ({ onApplyFilter, onResetFilter }: TableFilterProps) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortType, setSortType] = useState("");

  const handleResetFilter = () => {
    setSortType("");
    onResetFilter();
    setFilterOpen(false);
  };

  const handleApplyFilter = () => {
    const [sortItem, sortOrder] = sortType.split("-");
    onApplyFilter(sortItem, sortOrder);
    setFilterOpen(false);
  };
  return (
    <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
      <DropdownMenuTrigger className="bg-emerald-600 hover:bg-emerald-700 rounded-lg p-2 text-gray-50 flex items-center gap-x-2 text-sm">
        <LuSettings2 /> Filter
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuLabel>Email type</DropdownMenuLabel>
        <DropdownMenuGroup>
          <Select>
            <SelectTrigger className="w-full]">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="flex" value="point-asc">
                <div className="flex items-center gap-1">
                  <FaCircleDot size={10} className="text-green-500" />
                  Verified
                </div>
              </SelectItem>
              <SelectItem value="point-desc">
                <div className="flex items-center gap-1">
                  <FaCircleDot size={10} className="text-red-600" />
                  Non-verified
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="mt-3" />
        <DropdownMenuLabel>Faculty</DropdownMenuLabel>
        <DropdownMenuGroup>
          <Select>
            <SelectTrigger className="w-full]">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(Faculty).map((item, index) => (
                <SelectItem key={index} className="flex" value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
  );
};

export default TableFilter;
