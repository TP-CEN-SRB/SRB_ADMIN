"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAllBins } from "@/app/action/bin";

interface StatsData {
  color?: string;
  icon?: React.ReactNode;
  title?: string;
  value?: number;
  description?: string;
}
interface StatsGridProps {
  statsData: StatsData[];
}

const StatsGrid = ({ statsData }: StatsGridProps) => {
  const [loading, setLoading] = useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [totalBinsByDate, setTotalBinsByDate] = useState(statsData[1].value);
  const [datetime, setDatetime] = useState(`${new Date().toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  )}, ${new Date()
    .toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .toLowerCase()}
`);
  const router = useRouter();

  const refreshData = () => {
    setLoading(true);
    router.refresh();
    setDatetime(`${new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}, ${new Date()
      .toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })
      .toLowerCase()}
`);
    setLoading(false);
  };

  // const filterByDate = () => {
  //   const fetchDateBySelectedDate = async () => {
  //     //const result = await getAllBins(date?.from, date?.to);
  //     const result = await getAllBins();
  //     setTotalBinsByDate(result.length);
  //   };
  //   fetchDateBySelectedDate();
  // };

  return (
    <>
      <div className="px-4 md:px-6 lg:px-8 mt-4">
        <div className="flex flex-col gap-6 md:flex-row md:items-center justify-between">
          {/* Refresh Button and Last Updated Info */}
          <div className="flex flex-col gap-2 md:gap-4">
            <Button
              variant="secondary"
              className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 text-gray-600 font-semibold w-[200px] flex items-center justify-center"
              onClick={refreshData}
              disabled={loading}
            >
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin" />
              ) : (
                "Refresh Data"
              )}
            </Button>
            <span className="text-gray-500 text-sm sm:text-base">
              Last updated: {datetime}
            </span>
          </div>

          {/* Date Picker and Filter */}
          <div className="flex flex-wrap gap-4 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-[300px] justify-start text-left font-normal shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-300",
                    !date && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 text-gray-500" />
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
              <PopoverContent
                className="w-auto p-0 shadow-lg rounded-md"
                align="start"
              >
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              className="shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-300"
              //onClick={filterByDate}
            >
              Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {statsData.map((data, index) => {
            return (
              <div
                key={index}
                className="relative bg-white p-4 flex flex-col gap-2 rounded-lg overflow-hidden"
              >
                <div
                  className={`absolute inset-y-0 left-0 w-2.5 rounded-l-lg`}
                  style={{ backgroundColor: data.color }}
                ></div>

                <div className="pl-4">
                  <div className="flex items-center gap-2">
                    <span className="" style={{ color: data.color }}>
                      {data.icon}
                    </span>
                    <span className="text-lg sm:text-xl font-bold">
                      {data.title}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-3xl sm:text-4xl">
                      {data.value}
                    </span>
                    <span className="font-light text-sm sm:text-base">
                      {data.description}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default StatsGrid;
