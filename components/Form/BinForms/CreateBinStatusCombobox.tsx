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
import { BinStatus } from "@prisma/client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ControllerRenderProps } from "react-hook-form";

const CreateBinStatusCombobox = ({
  field,
}: {
  field: ControllerRenderProps<
    {
      location: string;
      status: "FUNCTIONAL" | "UNDER_MAINTENANCE";
      materialIds: [string, ...string[]];
    },
    "status"
  >;
}) => {
  const [open, setOpen] = useState(false);
  const [createValue, setCreateValue] = useState<
    "FUNCTIONAL" | "UNDER_MAINTENANCE" | undefined
  >(field?.value || "");

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
          {createValue
            ? Object.values(BinStatus).find((status) => status === createValue)
            : "Select status..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search status..." />
          <CommandList>
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {Object.values(BinStatus).map((status, idx) => (
                <CommandItem
                  key={idx}
                  value={status}
                  onSelect={(currentValue) => {
                    setCreateValue(
                      currentValue === createValue
                        ? undefined
                        : (currentValue as "FUNCTIONAL" | "UNDER_MAINTENANCE")
                    );
                    setOpen(false);
                    field?.onChange(currentValue); // Handles both create and update
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      createValue === status ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {status.replace("_", " ")}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CreateBinStatusCombobox;
