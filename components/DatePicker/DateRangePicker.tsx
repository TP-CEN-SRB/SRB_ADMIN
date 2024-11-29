"use client";

import * as React from "react";
import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getYears, months } from "@/utils/dateUtils";

interface DatePickerProps {
  startYear?: number;
  endYear?: number;
  className?: string;
  initialDate?: DateRange;
  onDateChange: (dateRange: DateRange | undefined) => void;
  disabled?: boolean;
}
export default function DateRangePicker({
  startYear = getYear(new Date()) - 100,
  endYear = getYear(new Date()) + 100,
  className,
  onDateChange,
  initialDate = undefined,
  disabled = false,
}: DatePickerProps) {
  const years = getYears(startYear, endYear);
  const [date, setDate] = React.useState<DateRange | undefined>(initialDate);
  const [calendarMonth, setCalendarMonth] = React.useState<number>(
    getMonth(new Date())
  );
  const [calendarYear, setCalendarYear] = React.useState<number>(
    getYear(new Date())
  );
  const handleDateChange = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    onDateChange(selectedDate);
  };
  const handleMonthChange = (month: string) => {
    setCalendarMonth(months.indexOf(month));
  };

  const handleYearChange = (year: string) => {
    setCalendarYear(parseInt(year));
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            disabled={disabled}
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex gap-x-4 items-center pl-4 pr-4 pt-4">
            <Select
              onValueChange={handleMonthChange}
              value={months[calendarMonth]}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={handleYearChange}
              value={calendarYear.toString()}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year, index) => (
                  <SelectItem key={index} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Calendar
            className="min-h-[350px]"
            initialFocus
            mode="range"
            defaultMonth={new Date()}
            selected={date}
            onSelect={handleDateChange}
            numberOfMonths={2}
            onMonthChange={(newMonth) => {
              setCalendarMonth(getMonth(newMonth));
              setCalendarYear(getYear(newMonth));
            }}
            month={setMonth(setYear(new Date(), calendarYear), calendarMonth)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
