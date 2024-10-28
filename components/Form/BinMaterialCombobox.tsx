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
import { BinMaterial, BinStatus } from "@prisma/client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ControllerRenderProps } from "react-hook-form";
import { z } from "zod";
import { BinSchema } from "@/schemas";

const BinMaterialCombobox = ({
  field,
}: {
  field: ControllerRenderProps<z.infer<typeof BinSchema>>;
}) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(field.value || "");

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
          {value
            ? Object.values(BinMaterial).find((material) => material === value)
            : "Select material..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search material..." />
          <CommandList>
            <CommandEmpty>No material found.</CommandEmpty>
            <CommandGroup>
              {Object.values(BinMaterial).map((material, idx) => (
                <CommandItem
                  key={idx}
                  value={material}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                    field.onChange(currentValue);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === material ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {material}
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
