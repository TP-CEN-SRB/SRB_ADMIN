"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaFilter } from "react-icons/fa";

type Checked = DropdownMenuCheckboxItemProps["checked"];

interface QuestUserFilterDropdownProps {
  selectedFaculties: string[];
  selectedCompletion: string[];
  onChange: (filter: {
    faculty: string[];
    completion: string[];
  }) => void;
}

const allFaculties = ["ENG", "DES", "IIT", "BUS"];
const completionOptions = ["Completed", "Not Completed"];

const QuestUserFilterDropdown = ({
  selectedFaculties,
  selectedCompletion,
  onChange,
}: QuestUserFilterDropdownProps) => {
  const handleToggle = (
    type: "faculty" | "completion",
    value: string,
    checked: boolean
  ) => {
    const updated = type === "faculty"
      ? [...selectedFaculties]
      : [...selectedCompletion];

    if (checked) {
      updated.push(value);
    } else {
      const index = updated.indexOf(value);
      if (index > -1) updated.splice(index, 1);
    }

    onChange({
      faculty: type === "faculty" ? updated : selectedFaculties,
      completion: type === "completion" ? updated : selectedCompletion,
    });
  };

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
            onCheckedChange={(checked) =>
              handleToggle("faculty", f, Boolean(checked))
            }
          >
            {f}
          </DropdownMenuCheckboxItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {completionOptions.map((s) => (
          <DropdownMenuCheckboxItem
            key={s}
            checked={selectedCompletion.includes(s)}
            onCheckedChange={(checked) =>
              handleToggle("completion", s, Boolean(checked))
            }
          >
            {s}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QuestUserFilterDropdown;
