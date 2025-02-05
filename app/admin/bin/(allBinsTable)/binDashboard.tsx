"use client";

import { formatDateTime } from "@/utils/dateFilter";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BsActivity } from "react-icons/bs";
import { RiDeleteBin6Line, RiRecycleFill } from "react-icons/ri";
import { TiWarningOutline } from "react-icons/ti";
import { Button } from "@/components/ui/button";
import { MdDateRange } from "react-icons/md";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ChartConfig } from '@/components/ui/chart';
import Chart from '../../components/chart';
import BinTimeChart from '../../components/binTimeChart';
import { BarChartConfig } from './chartConfigs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Loading from '@/app/admin/loading';
import { DateRange } from '@/utils/dateUtils';
import { IoMdInformationCircleOutline } from "react-icons/io";
import { truncateText } from '@/utils/truncateString';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ConfirmResolveBinIssueDialog from '@/components/Dialog/ConfirmResolveBinIssueDialog';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MoreHorizontal } from 'lucide-react';
import { IoLocation } from "react-icons/io5";
import { MdOutlineDownloadDone } from "react-icons/md";

interface BinDashboardProps {
  DBBarChartData: {
    month: string;
    bin: number;
  }[];
  DBPieChartData: { fac: string; count: number; fill: string }[];
  DBLineChartData: { hour: string; [key: string]: string | number }[];
  initialStatsData: number[];
  UMBinsData: {
    id: string;
    user: {
        lat: string | null;
        long: string | null;
        location: string | null;
    };
    binMaterial: {
      name: string;
    };
  }[]

fetchAll: (startDate?: Date, endDate?: Date, filter?: string) => Promise<{
  dashboardData: {
    totalFuncBins: number;
    totalCount: number;
    totalDisposalCount: number;
    totalUMBins: number;
  }
  chartsData: {
    DBBarChartData: {
      month: string;
      bin: number;
    }[];
    DBPieChartData: { fac: string; count: number; fill: string; }[];
    binDisposalsTimeLine: {hour: string;
      [key: string]: string | number;}[];
  }
  UMBinsData: {
    id: string;
  user: {
      lat: string | null;
      long: string | null;
      location: string | null;
  };
  binMaterial: {
      name: string;
  };
  }[]
}>
}
type FilterPeriod = "all time" | "week" | "month" | "year";
type ChartDataItem = {
  month: string;
  bin: number;
  [key: string]: string | number; // This allows for any additional string properties
};

const BinDashboard = ({DBBarChartData, DBPieChartData, DBLineChartData, initialStatsData, UMBinsData, fetchAll}: BinDashboardProps) => {
    const [isActive, setIsActive] = useState<FilterPeriod>();
    const [isFetching, setIsFetching] = useState(false);
    const [gridData, setGridData] = useState<number[]>(initialStatsData);
    const [chartData, setChartData] = useState<[typeof DBBarChartData, typeof DBPieChartData]>([DBBarChartData, DBPieChartData]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [binId, setBinId] = useState<string>('');
    const [isResolved, setIsResolved] = useState(false);
    const [UMBinsTable, setUMBinsTable] = useState(UMBinsData);
    const [lineChart, setLineChart] = useState(DBLineChartData);
    const [datetime, setDateTime] = useState(formatDateTime(new Date()));
    
    const { month, bin, ...materials }: ChartDataItem = DBBarChartData[0];
    const barChartConfig = BarChartConfig({ materials }) as ChartConfig;
    const binDisposalsTimeLineConfig = {
      totalDisposals: {
        label: "Total",
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

  const getDateRange = (period: FilterPeriod) => DateRange(period);

    const handlePeriodChange = useCallback(async (period: FilterPeriod) => {
        setIsFetching(true);
        try {
            const {startDate, endDate} = getDateRange(period);
            if ((startDate && endDate) !== undefined) {
                const { dashboardData: { totalFuncBins, totalCount, totalDisposalCount, totalUMBins }, chartsData: { DBBarChartData, DBPieChartData, binDisposalsTimeLine }, UMBinsData: UMBinsUpdate } 
                = await fetchAll(startDate, endDate, period);
                setGridData([totalFuncBins, totalCount, totalDisposalCount, totalUMBins]);
                setChartData([DBBarChartData, DBPieChartData]);
                setLineChart(binDisposalsTimeLine);
                setUMBinsTable(UMBinsUpdate);
            } else {
              setGridData(initialStatsData);
              setChartData([DBBarChartData, DBPieChartData]);
              setLineChart(DBLineChartData);
              setUMBinsTable(UMBinsData);
            }
        } catch (error){
          console.log(error);
            toast({
              title: "Error!",
              description: "Failed to fetch data, Handle Period Change",
              duration: 2000,
              variant: "destructive",
            })
        } finally {
            setIsFetching(false);
        }
        },[getDateRange]);


    useEffect(() => {
      const updateUMBinsTable = async () => {
        if (isResolved){
        setIsFetching(true);
        try {
        const { startDate, endDate } = getDateRange(isActive || "all time");
            const { dashboardData: { totalFuncBins, totalCount, totalDisposalCount, totalUMBins }, UMBinsData: UMBinsUpdate } = await fetchAll(startDate, endDate, isActive);
            setUMBinsTable(UMBinsUpdate);
            setGridData([totalFuncBins, totalCount, totalDisposalCount, totalUMBins]);
        } catch (error) {
          toast({
            title: "Error!",
            description: "Failed to update bin status",
            duration: 2000,
            variant: "destructive",
          });
        } finally {
          setIsResolved(false);
        setIsFetching(false);
        }
      }
      };
      updateUMBinsTable();
    }, [isResolved]);

    const binDashBoardItems = useMemo(()=> [
        {
          color: "#34b7eb",
          icon: <BsActivity className="text-xl sm:text-2xl text-[#34b7eb] mr-2" />,
          title: "Bins Status",
          description: "Functional Bins",
        },
        {
          color: "#54666b",
          icon: (
            <RiDeleteBin6Line className="text-xl sm:text-2xl text-[#54666b] mr-2" />
          ),
          title: "Total Bins",
          description: "All locations",
          map: "/admin/bin/manager/map",
        },
        {
          color: "#22e38f",
          icon: (
            <RiRecycleFill className="text-xl sm:text-2xl text-[#22e38f] mr-2" />
          ),
          title: "Total Items Collected",
          description: "Items",
        },
        {
          color: "#f44336",
          icon: (
            <TiWarningOutline className="text-xl sm:text-2xl text-[#f44336] mr-2" />
          ),
          title: "Alerts",
          description: "Issues found",
          button: "View",
        },
      ], []);
    
    const router = useRouter();
    const {data, isLoading, refetch} = useQuery({
      queryKey: ['bins', {type: UMBinsData}],
      queryFn: async () => {
        try{
        const { startDate, endDate } = getDateRange(isActive || "all time");
        const data = await fetchAll(startDate, endDate, isActive);
        setGridData([data.dashboardData.totalFuncBins, data.dashboardData.totalCount, data.dashboardData.totalDisposalCount, data.dashboardData.totalUMBins]);
        setChartData([data.chartsData.DBBarChartData, data.chartsData.DBPieChartData]);
        setLineChart(data.chartsData.binDisposalsTimeLine);
        setUMBinsTable(data.UMBinsData);
        setDateTime(formatDateTime(new Date()));
        return data;
        }
        catch (error){
          toast({
            title: "Error!",
            description: "Failed to fetch data",
            duration: 2000,
            variant: "destructive",
          })
        }
      },
      refetchOnMount: false,
      refetchInterval: 36000,
      refetchOnWindowFocus: false,
      retry: false,
    })

  return (
    <>
    {isFetching ? <Loading/> : <>
    <ConfirmResolveBinIssueDialog 
      binId={binId} 
      isOpen={isDeleteDialogOpen} 
      handleDialogOpen={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)} 
      isResolved={isResolved}
      handleResolved={() => setIsResolved(!isResolved)}/>
      <div className="px-4 md:px-6 lg:px-8 mt-4">
        <div className="flex flex-row md:items-center justify-between">
            <span className="text-gray-600 text-sm sm:text-base" suppressHydrationWarning={true}>
              Last updated: {datetime}
            </span>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
              >
                <MdDateRange focusable="false" className="text-gray-600" />
                <span className="text-md font-bold text-gray-600">
                  Date Filters
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              {(["all time", "week", "month", "year"] as FilterPeriod[]).map(
                (period) => (
                  <DropdownMenuItem
                    key={period}
                    onClick={() => {
                      handlePeriodChange(period);
                      setIsActive(period);
                      console.log(period);
                    }}
                  >
                    <span
                      className={`${
                        isActive === period
                          ? "font-bold text-gray-800 text-2xl"
                          : " font-bold text-gray-600"
                      }`}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </span>
                  </DropdownMenuItem>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {binDashBoardItems.map((items, index) => {
            return (
              <div
                key={index}
                className="relative bg-white p-4 flex flex-col gap-2 rounded-lg overflow-hidden"
              >
                <div
                  className={`absolute inset-y-0 left-0 w-2.5 rounded-l-lg`}
                  style={{ backgroundColor: items.color }}
                ></div>

                <div className="pl-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <span style={{ color: items.color }}>
                        {items.icon}
                      </span>
                      {items.button ? (
                        <span className="text-lg sm:text-xl font-bold text-[#f44336]">
                          {items.title}
                        </span>
                      ) : (
                        <span className="text-lg sm:text-xl font-bold">
                          {items.title}
                        </span>
                      )}
                    </div>
                    {items.button && (
                      <Dialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <IoMdInformationCircleOutline className='text-xl sm:text-3xl text-[#f44336] mr-2 hover:cursor-pointer hover:animate-sway'/>
                        </DialogTrigger>
                        <DialogContent className="w-[90vw] min-h-[500px] max-h-[90vh] sm:max-w-screen-sm rounded-md flex flex-col items-center">
                          <DialogHeader className='w-full items-center'>
                            <DialogTitle>Bins Under Maintenance</DialogTitle>
                            <DialogDescription>
                              Update the status of the bin. Click resolve if
                              issue has been corrected.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="rounded-md border w-full">
                            <div className="max-h-[400px] overflow-y-auto">
                              <Table className="w-full">
                                <TableHeader className='bg-gray-200 hover:bg-gray-300'>
                                  <TableRow>
                                    <TableHead className="text-center font-bold text-md text-gray-800">
                                      Location
                                    </TableHead>
                                    <TableHead className="text-center font-bold text-md text-gray-800">
                                      Type
                                    </TableHead>
                                    <TableHead className="text-center font-bold text-md text-gray-800">
                                      Action
                                    </TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  
                                  {UMBinsTable?.map((bin, index) => (
                                    <TableRow key={index}>
                                      <TableCell className="text-center">
                                        <Tooltip>
                                          <TooltipTrigger>
                                          {truncateText(bin.user.location as string, 10)}
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            {bin.user.location}
                                          </TooltipContent>
                                        </Tooltip>
                                        </TableCell>
                                      <TableCell className="text-center">
                                        {bin.binMaterial.name.length > 10 ? 
                                        <>
                                          <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger>
                                          {truncateText(bin.binMaterial.name as string, 10)}
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            {bin.binMaterial.name}
                                          </TooltipContent>
                                        </Tooltip>
                                        </TooltipProvider>
                                        </>
                                        : bin.binMaterial.name}
                                        </TableCell>
                                      <TableCell className="text-center">
                                        <DropdownMenu modal={false}>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="hover:bg-gray-300 h-8 w-8 p-0">
                                              <span className="sr-only">Open menu</span>
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                          <DropdownMenuItem className="flex items-center font-bold text-sm text-gray-600" 
                                          onClick={() => (setIsDeleteDialogOpen(!isDeleteDialogOpen), setBinId(bin.id))}>
                                            <MdOutlineDownloadDone />
                                            <span className="hover:cursor-pointer">
                                              Resolved
                                            </span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="flex items-center font-bold text-sm text-gray-600">
                                            <IoLocation />
                                            <span
                                              className="hover:cursor-pointer font-bold"
                                              onClick={() => (router.push(`/admin/bin/manager/map?lat=${bin.user.lat}&long=${bin.user.long}`))}
                                            >
                                              View Bin Location
                                            </span>
                                          </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-3xl sm:text-4xl">
                      {items.map ? (
                            <span className="hover:cursor-pointer" onClick={() => router.push(`${items.map}`)}>{gridData[index]}</span>
                          ) : (
                            gridData[index]
                          )}
                    </span>
                    <span className="font-light text-sm sm:text-base">
                      {items.description}
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
        barChartConfig={barChartConfig}
      />
      <BinTimeChart
        chartData={lineChart}
        binTimeLineChartConfig={binDisposalsTimeLineConfig}
      />
    </>}
    </>
  );
};

export default BinDashboard;
