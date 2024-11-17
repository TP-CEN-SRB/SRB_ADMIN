import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioItem,
  DropdownMenuRadioGroup,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { IoFilter } from "react-icons/io5";
import { HiSortAscending, HiSortDescending } from "react-icons/hi";
import { FaCheck } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";

interface TableFilterProps {
  onSearch: (e: string) => void;
  query: string | null;
  onApplyFilter: (sortItem: string, sortOrder: string) => void;
  onResetFilter: () => void;
}
const TableFilter = ({
  query,
  onSearch,
  onApplyFilter,
  onResetFilter,
}: TableFilterProps) => {
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
    <div className="flex items-center p-3">
      <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
        <DropdownMenuTrigger className="bg-emerald-600 hover:bg-emerald-700 rounded-lg p-3 text-gray-50">
          <IoFilter />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Points</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sortType} onValueChange={setSortType}>
            <DropdownMenuRadioItem
              onSelect={(e) => e.preventDefault()}
              value="point-asc"
            >
              <HiSortAscending />
              Sort ascending
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              onSelect={(e) => e.preventDefault()}
              value="point-desc"
            >
              <HiSortDescending />
              Sort descending
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Disposals</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sortType} onValueChange={setSortType}>
            <DropdownMenuRadioItem
              onSelect={(e) => e.preventDefault()}
              value="disposal-asc"
            >
              <HiSortAscending />
              Sort ascending
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              onSelect={(e) => e.preventDefault()}
              value="disposal-desc"
            >
              <HiSortDescending />
              Sort descending
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup className="flex">
            <Button
              onClick={handleApplyFilter}
              className="flex-1"
              variant="ghost"
            >
              <FaCheck />
              Apply
            </Button>
            <Button
              onClick={handleResetFilter}
              className="flex-1"
              variant="ghost"
            >
              <RxCross1 />
              Reset
            </Button>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex items-center gap-x-3 px-3">
        <Input
          type="search"
          defaultValue={encodeURIComponent(query ?? "")}
          onChange={(e) => {
            onSearch(e.target.value ?? "");
          }}
          placeholder="Filter students..."
          className="max-w-sm"
        />
      </div>
    </div>
  );
};

export default TableFilter;
