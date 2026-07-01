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
import { FaPlusCircle } from "react-icons/fa";

type Checked = DropdownMenuCheckboxItemProps["checked"];

const AllBinsTableStatusDropdown = () => {
  const [showFunctional, setShowFunctional] = React.useState<Checked>(true);
  const [showUnderMaintenance, setShowUnderMaintenance] =
    React.useState<Checked>(false);
  // const handleFilterChange = (status, checked) => {
  //   if (status === "FUNCTIONAL") {
  //     setShowFunctional(checked);
  //   } else if (status === "UNDER_MAINTENANCE") {
  //     setShowUnderMaintenance(checked);
  //   }

  //   const selectedStatuses = [];
  //   if (checked && status === "FUNCTIONAL")
  //     selectedStatuses.push("FUNCTIONAL");
  //   if (checked && status === "UNDER_MAINTENANCE")
  //     selectedStatuses.push("UNDER_MAINTENANCE");

  //   // If both or none are selected, show all
  //   if (selectedStatuses.length === 0 || selectedStatuses.length === 2) {
  //     table.getColumn("status")?.setFilterValue(undefined);
  //   } else {
  //     table.getColumn("status")?.setFilterValue(selectedStatuses);
  //   }
  // };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <FaPlusCircle />
          Status
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Statuses</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={showFunctional}
          onCheckedChange={setShowFunctional}
        >
          Functional
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={showUnderMaintenance}
          onCheckedChange={setShowUnderMaintenance}
        >
          Under Maintenance
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AllBinsTableStatusDropdown;
