"use client";

import { formatDateTime } from '@/utils/dateFilter';
import React, { useCallback, useMemo, useState } from 'react'
import { BsActivity } from 'react-icons/bs';
import { RiDeleteBin6Line, RiRecycleFill } from 'react-icons/ri';
import { TiWarningOutline } from 'react-icons/ti';
import { Button } from "@/components/ui/button";
import { MdDateRange } from "react-icons/md";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { ChartConfig } from '@/components/ui/chart';
import Chart from '../../components/chart';
import BinTimeChart from '../../components/binTimeChart';
import { BarChartConfig, PieChartConfig } from './chartConfigs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface BinDashboardProps {
  DBBarChartData: {
    month: string;
    bin: number;
  }[];
  DBPieChartData: { binType: string; binCount: number; fill?: string }[];
  DBLineChartData: {hour: string;
  [key: string]: string | number;}[];
  initialStatsData: number[];
  fetchData: (startDate: Date, endDate: Date) => Promise<{
    // DBBarChartData: {
    //     month: string;
    //     bin: number;
    // }[];
    DBPieChartData: {binType: string;
  binCount: number;
  fill: string;}[];
    totalFuncBins: number;
    totalCount: number;
    totalDisposalCount: number;
    binDisposalsTimeLine: {hour: string;
  [key: string]: string | number;}[];
    totalUMBins: number;
  }>;
  fetchChartsData: (startDate: Date, endDate: Date, filter?: String) => Promise<{
    DBBarChartData: {
        month: string;
        bin: number;
    }[];
    DBPieChartData: {binType: string;
      binCount: number;
      fill: string;}[];
    binDisposalsTimeLine: {hour: string;
      [key: string]: string | number;}[];
  }>;
}

type FilterPeriod =  "all time" | "week" | "month" | "year" ;

const binDashboardUpdate = ({DBBarChartData, DBPieChartData, DBLineChartData, initialStatsData, fetchData, fetchChartsData}: BinDashboardProps) => {
    const [isActive, setIsActive] = useState<FilterPeriod>("all time");
    const [isLoading, setIsLoading] = useState(false);
    const [gridData, setGridData] = useState<number[]>(initialStatsData);
    const [chartData, setChartData] = useState<[typeof DBBarChartData, typeof DBPieChartData]>([DBBarChartData, DBPieChartData]);
    const [datetime, setDatetime] = useState(formatDateTime(new Date()));
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isRefreshData, setRefreshData] = useState(false);

        type ChartDataItem = {
        month: string;
        bin: number;
        [key: string]: string | number; // This allows for any additional string properties
      };
      const { month, bin, ...materials }: ChartDataItem = DBBarChartData[0];
      const barChartConfig = BarChartConfig({ materials }) as ChartConfig;
      const pieChartConfig = PieChartConfig({ DBPieChartData }) as ChartConfig;
      const binDisposalsTimeLineConfig = {
        totalDisposals: {
          label: "Total Disposals",
          color: "#0066CC",
        },
        binToolTipLabel: {
          label: "Disposals Hourly",
          color: "#0066CC",
        },
        ...Object.entries(materials).reduce(
          (acc, [material, _], index) => ({
            ...acc,
            [material]: {
              label: material,
              color: `hsl(${170 + index * 15}, 70%, 50%)`,
            },
          }),
          {}
        ),
      } satisfies ChartConfig;

    const getDateRange = (period: FilterPeriod) => {
    const now = new Date();
    
    switch (period) {
        case "week": {
        const monday = now.getDate() - ((now.getDay() + 6) % 7);
        
        const startDate = new Date(now.setDate(monday));
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(now);
        endDate.setDate(monday + 6); // Add 6 days to get to Sunday
        endDate.setHours(23, 59, 59, 999);

        return { startDate, endDate };
        }
        case "month": {
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);

        return { startDate, endDate };
        }
        case "year": {
        const startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(now.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);

        return { startDate, endDate };
        }
        case "all time": {
          return {startDate: undefined, endDate: undefined};
        }
    }
    };

    const handlePeriodChange = useCallback(async (period: FilterPeriod) => {
        setIsLoading(true);
        try {
            const {startDate, endDate} = getDateRange(period);
            if (startDate && endDate) {
                const {totalFuncBins, totalCount, totalDisposalCount, totalUMBins} = await fetchData(startDate, endDate);
                const {DBBarChartData, DBPieChartData} = await fetchChartsData(startDate, endDate, period);
                setGridData([totalFuncBins, totalCount, totalDisposalCount, totalUMBins]);
                setChartData([DBBarChartData, DBPieChartData]);
            } else {
              setGridData(initialStatsData);
              setChartData([DBBarChartData, DBPieChartData]);
            }
        } catch (error){
            console.log(error);
        } finally {
            setIsLoading(false);
        }
        },[getDateRange]);

    const refreshData = () => {
        setRefreshData(true);
        setDatetime(formatDateTime(new Date()));
        setRefreshData(false);
    };

    const binDashBoardItems = useMemo(()=> [
        {
          color: "#34b7eb",
          icon: <BsActivity className="text-xl sm:text-2xl text-[#34b7eb] mr-2" />,
          title: "Bins Status",
          value: gridData[0],
          description: "Functional Bins",
        },
        {
          color: "#54666b",
          icon: (
            <RiDeleteBin6Line className="text-xl sm:text-2xl text-[#54666b] mr-2" />
          ),
          title: "Total Bins",
          value: gridData[1],
          description: "All locations",
        },
        {
          color: "#22e38f",
          icon: (
            <RiRecycleFill className="text-xl sm:text-2xl text-[#22e38f] mr-2" />
          ),
          title: "Total Items Collected",
          value: gridData[2],
          description: "Items",
        },
        {
          color: "#f44336",
          icon: (
            <TiWarningOutline className="text-xl sm:text-2xl text-[#f44336] mr-2" />
          ),
          title: "Alerts",
          value: gridData[3],
          description: "Issues found",
          button: "View",
        },
      ], [gridData]);
    
    const onDialogClick = () => {
    setIsDialogOpen(true);
    };
    const totalBins = useMemo(() => {
      return chartData[1]?.reduce((acc, curr) => acc + curr.binCount, 0);
    }, [chartData[1]]);

  return (
    <>
      <div className="px-4 md:px-6 lg:px-8 mt-4">
        <div className="flex flex-row md:items-center justify-between">
          {/* Refresh Button and Last Updated Info */}
          <div className="flex flex-col gap-2 md:gap-4">
            <Button
              variant="secondary"
              className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 text-gray-600 font-semibold w-[200px] flex items-center justify-center"
              onClick={refreshData}
            >
              {isRefreshData ? (
                <AiOutlineLoading3Quarters className="animate-spin" />
              ) : (
                "Refresh Data"
              )}
            </Button>
            <span className="text-gray-600 text-sm sm:text-base">
              Last updated: {datetime}
            </span>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
              >
                <MdDateRange focusable="false" className="text-gray-600" />
                <span className="text-md font-bold text-gray-600">Date Filters</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              {(['all time', 'week', 'month', 'year'] as FilterPeriod[]).map((period) => (
                <DropdownMenuItem
                  key={period}
                  onClick={() => {
                    handlePeriodChange(period);
                    setIsActive(period);
                  }}
                  
                >
                  <span
                    className={`${
                      isActive === period ? 'font-bold text-gray-800 text-2xl' : ' font-bold text-gray-600'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
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
                      <Dialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button variant="secondary" onClick={onDialogClick}>
                            {data.button}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-screen-sm">
                          <DialogHeader>
                            <DialogTitle>Bins with issues</DialogTitle>
                            <DialogDescription>
                              Update the status of the bin. Click resolve if
                              issue has been corrected.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-center">
                                    Location
                                  </TableHead>
                                  <TableHead className="text-center">
                                    Type
                                  </TableHead>
                                  <TableHead className="text-center">
                                    Status
                                  </TableHead>
                                  <TableHead className="text-center">
                                    Action
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="text-center">
                                    Block A
                                  </TableCell>
                                  <TableCell className="text-center">
                                    Recycling
                                  </TableCell>
                                  <TableCell className="text-center">
                                    Full
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button
                                      className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                                      variant="secondary"
                                    >
                                      Resolve
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                          <DialogFooter></DialogFooter>
                        </DialogContent>
                      </Dialog>
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
      <Chart
        barChartData={chartData[0]}
        pieChartData={chartData[1]}
        pieChartSum={totalBins}
        barChartConfig={barChartConfig}
        pieChartConfig={pieChartConfig}
      />
      <BinTimeChart
        chartData={DBLineChartData}
        binTimeLineChartConfig={binDisposalsTimeLineConfig}
      />
    </>
  )
}

export default binDashboardUpdate;
