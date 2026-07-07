import { Check, ChevronsUpDown } from "lucide-react"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Faculty } from "@/generated/prisma"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { ControllerRenderProps, FieldValues } from "react-hook-form"
import { z } from "zod"

type FacultyComboBoxProps<T extends z.ZodTypeAny> = {
  field: ControllerRenderProps<z.infer<T> extends FieldValues ? z.infer<T> : FieldValues>
  disabled: boolean
}

const FacultyComboBox = <T extends z.ZodTypeAny>({
  field,
  disabled,
}: FacultyComboBoxProps<T>) => {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(field.value || "")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex"
        >
          <ChevronsUpDown className="-ml-2 mr-2 h-4 w-4 shrink-0 opacity-50" />
          {value
            ? Object.values(Faculty).find((faculty) => faculty === value)
            : "Select faculty..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search faculty..." />
          <CommandList>
            <CommandEmpty>No faculty found.</CommandEmpty>
            <CommandGroup>
              {Object.values(Faculty).map((faculty, idx) => (
                <CommandItem
                  key={idx}
                  value={faculty}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue)
                    setOpen(false)
                    field.onChange(currentValue)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === faculty ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {faculty}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default FacultyComboBox
