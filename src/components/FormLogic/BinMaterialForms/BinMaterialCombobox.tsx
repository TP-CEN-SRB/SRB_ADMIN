import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { BinMaterial, BinStatus } from "@/generated/prisma";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ControllerRenderProps } from "react-hook-form";

interface BinMaterialComboboxProps {
  materials: BinMaterial[]; // `materials` is now a string array
  field: ControllerRenderProps<
    {
      status: "FUNCTIONAL" | "UNDER_MAINTENANCE";
      location: string;
      materialId: string;
    },
    "materialId"
  >;
  currentFieldName: string;
}

const BinMaterialCombobox = ({
  materials,
  field,
  currentFieldName,
}: BinMaterialComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(currentFieldName || "");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex"
        >
          <ChevronsUpDown className="-ml-2 mr-2 h-4 w-4 shrink-0 opacity-50" />
          {value || "Select material..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search material..." />
          <CommandList>
            <CommandEmpty>No material found.</CommandEmpty>
            <CommandGroup>
              {materials.map((material) => (
                <CommandItem
                  key={material.id}
                  onSelect={() => {
                    const newValue = material.id;
                    setValue(material.name);
                    setOpen(false);
                    field.onChange(newValue);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === material.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {material.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default BinMaterialCombobox;
