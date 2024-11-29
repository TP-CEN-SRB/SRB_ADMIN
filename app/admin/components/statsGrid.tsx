"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useReducer, useState } from "react";
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
import {
  getAllBins,
  getBinCountsByStatus,
  getDisposals,
} from "@/app/action/bin";
import { BsActivity } from "react-icons/bs";
import { RiDeleteBin6Line, RiRecycleFill } from "react-icons/ri";
import { TiWarningOutline } from "react-icons/ti";

interface StatsGridProps {
  initialStatsData: number[];
}

interface IState {
  totalBins: number;
  totalDisposals: number;
  totalFunctionalBins: number;
  totalUMBins: number;
}

interface IAction {
  type: string;
  values?: number[];
}

const StatsGrid = ({ initialStatsData }: StatsGridProps) => {
  const initialState: IState = {
    totalBins: initialStatsData[0],
    totalDisposals: initialStatsData[1],
    totalFunctionalBins: initialStatsData[2],
    totalUMBins: initialStatsData[3],
  };

  const statsReducer = (state: IState, action: IAction) => {
    switch (action.type) {
      case "UPDATE_STATS":
        return {
          ...state,
          totalBins: action.values![0],
          totalDisposals: action.values![1],
          totalFunctionalBins: action.values![2],
          totalUMBins: action.values![3],
        };
      case "RESET_STATS":
        return initialState;
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(statsReducer, {
    totalBins: initialStatsData[1],
    totalDisposals: initialStatsData[2],
    totalFunctionalBins: initialStatsData[0],
    totalUMBins: initialStatsData[3],
  });

  const [loading, setLoading] = useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>();
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

  const refreshData = () => {
    setLoading(true);
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
    dispatch({ type: "RESET_STATS" });
    setLoading(false);
  };

  const filterByDate = async () => {
    setLoading(true);
    const fetchedData = await fetchDataBasedOnDateRange(date); // Fetch data based on selected date range
    dispatch({
      type: "UPDATE_STATS",
      values: fetchedData, // Assuming fetchedData is an array of [totalFunctionalBins, totalBins, totalDisposals, totalUMBins]
    });
    setLoading(false);
  };

  const fetchDataBasedOnDateRange = async (
    date: DateRange | undefined
  ): Promise<number[]> => {
    const updateBinCountByStatus = await getBinCountsByStatus(
      date?.from,
      date?.to
    );
    const updateAllBins = await getAllBins(date?.from, date?.to);
    const updateDisposals = await getDisposals(date?.from, date?.to);
    const updateUMBins = await getBinCountsByStatus(date?.from, date?.to, true);
    return [
      updateBinCountByStatus,
      updateAllBins.length,
      updateDisposals,
      updateUMBins,
    ]; // Example data
  };

  const binDashBoardItems = [
    {
      color: "#34b7eb",
      icon: <BsActivity className="text-xl sm:text-2xl text-[#34b7eb] mr-2" />,
      title: "Bins Status",
      value: state.totalFunctionalBins,
      description: "Functional Bins",
    },
    {
      color: "#54666b",
      icon: (
        <RiDeleteBin6Line className="text-xl sm:text-2xl text-[#54666b] mr-2" />
      ),
      title: "Total Bins",
      value: state.totalBins,
      description: "All locations",
    },
    {
      color: "#22e38f",
      icon: (
        <RiRecycleFill className="text-xl sm:text-2xl text-[#22e38f] mr-2" />
      ),
      title: "Total Items Collected",
      value: state.totalDisposals,
      description: "Items",
    },
    {
      color: "#f44336",
      icon: (
        <TiWarningOutline className="text-xl sm:text-2xl text-[#f44336] mr-2" />
      ),
      title: "Alerts",
      value: state.totalUMBins,
      description: "Issues found",
      button: "View",
    },
  ];

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
              onClick={filterByDate}
            >
              Filter
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {binDashBoardItems.map((data, index) => {
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
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="" style={{ color: data.color }}>
                        {data.icon}
                      </span>
                      {data.button ? (
                        <span className="text-lg sm:text-xl font-bold text-[#f44336]">
                          {data.title}
                        </span>
                      ) : (
                        <span className="text-lg sm:text-xl font-bold">
                          {data.title}
                        </span>
                      )}
                    </div>
                    {data.button && (
                      <Button variant="secondary">{data.button}</Button>
                    )}
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
