import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { FaTableCells } from "react-icons/fa6";
import { PiExportBold } from "react-icons/pi";
import { CSVLink } from "react-csv";
import { Bin } from "./columns";

interface ExportCSVProps<TData> {
  data: TData[];
}

const ExportCSV = <TData,>({ data }: ExportCSVProps<TData>) => {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <DropdownMenu open={filterOpen} onOpenChange={setFilterOpen}>
      <DropdownMenuTrigger className="bg-emerald-600 hover:bg-emerald-700 rounded-lg p-2 text-gray-50 flex items-center gap-x-1 text-sm">
        <PiExportBold /> Export
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuItem>
          <FaTableCells />
          <CSVLink
            className="cursor-default"
            filename="bins_dataset"
            data={(data as Bin[]).map((bin) => ({
              id: bin.id,
              location: bin.user.location,
              status: bin.status,
              material: bin.binMaterial.name,
              pointBalance: bin.user.name,
            }))}
          >
            Export this dataset
          </CSVLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportCSV;
