"use client";

import { formatDateTime } from "@/utils/dateFilter";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BsActivity } from "react-icons/bs";
import { RiDeleteBin6Line, RiRecycleFill } from "react-icons/ri";
import { TiWarningOutline } from "react-icons/ti";
import { Button } from "@/components/ui/button";
import { MdDateRange } from "react-icons/md";
import { connectMqtt } from "@/lib/mqtt";
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
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MoreHorizontal } from 'lucide-react';
import { IoLocation } from "react-icons/io5";
import { formatDistanceToNow } from "date-fns";


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
    const [isActive, setIsActive] = useState<FilterPeriod>("all time");
    const [isFetching, setIsFetching] = useState(false);
    const [gridData, setGridData] = useState<number[]>(initialStatsData);
    const [chartData, setChartData] = useState<[typeof DBBarChartData, typeof DBPieChartData]>([DBBarChartData, DBPieChartData]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [lineChart, setLineChart] = useState(DBLineChartData);
    const [datetime, setDateTime] = useState(formatDateTime(new Date()));
    const [alertCount, setAlertCount] = useState(0);
    const [alertData, setAlertData] = useState<any[]>([]);
    const [sortField, setSortField] = useState<"capacity" | "lastSeen">("capacity");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

 
    
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
            console.log(startDate, endDate);
            if ((startDate && endDate) !== undefined) {
                const { dashboardData: { totalFuncBins, totalCount, totalDisposalCount, totalUMBins }, chartsData: { DBBarChartData, DBPieChartData, binDisposalsTimeLine }, UMBinsData: UMBinsUpdate } 
                = await fetchAll(startDate, endDate, period);
                setGridData([totalFuncBins, totalCount, totalDisposalCount, totalUMBins]);
                setChartData([DBBarChartData, DBPieChartData]);
                setLineChart(binDisposalsTimeLine);
            } else {
              setGridData(initialStatsData);
              setChartData([DBBarChartData, DBPieChartData]);
              setLineChart(DBLineChartData);
            }
        } catch (error){
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
          const fetchAlerts = async () => {
            try {
              const res = await fetch("/api/alerts", { cache: "no-store" });
              if (!res.ok) throw new Error("Failed to fetch alerts");
              const data: {
                id: string;
                location: string;
                material: string;
                capacity: number;
                lastHeartBeat: string | null;
                lat: number | null;
                long: number | null;
                alertLevel: "online" | "offline" | "warning" | "critical";
              }[] = await res.json();

              console.log("📡 Received Alerts:", data.length, data);
              // 🔹 filter duplicates locally (client-side)
              const uniqueAlerts = data.filter(
                (item, index, self) =>
                  index === self.findIndex((t) => t.id === item.id)
              );
              setAlertData(uniqueAlerts);

              // ✅ Explicitly typed filter
              const issues = data.filter(
                (b) =>
                  b.alertLevel === "offline" ||
                  b.alertLevel === "critical" ||
                  b.alertLevel === "warning"
              );

              setAlertCount(issues.length);
            } catch (error) {
              console.error("❌ Error fetching alerts:", error);
            }
          };

          fetchAlerts(); // initial fetch
          const interval = setInterval(fetchAlerts, 30000); // refresh every 30s
          return () => clearInterval(interval);
        }, []);

        // 🧠 Real-time MQTT listener to auto-update alerts & statuses
        useEffect(() => {
          let client: any;

          const initMqtt = async () => {
            try {
              client = await connectMqtt();
              if (client?.connected) return;

              client.subscribe("srb/heartbeat/#");
              console.log("📡 Subscribed to MQTT heartbeat topic");

              client.on("close", () => {
                console.warn("⚠️ MQTT connection closed, attempting reconnect...");
                setTimeout(initMqtt, 5000);
              });

              client.on("message", (topic: string, payload: Buffer) => {
                try {
                  const data = JSON.parse(payload.toString());
                  setAlertData(prev => {
                    const updated = prev.map((bin) =>
                      bin.id === data.binId
                        ? { ...bin, lastHeartBeat: data.timestamp, alertLevel: "online" }
                        : bin
                    );

                    const stillIssues = updated.filter(
                      (b) =>
                        b.alertLevel === "offline" ||
                        b.alertLevel === "critical" ||
                        b.alertLevel === "warning"
                    ).length;

                    setAlertCount(stillIssues);
                    return updated;
                  });
                  refetch?.();
                } catch (err) {
                  console.error("⚠️ Error parsing MQTT message:", err);
                }
              });
            } catch (err) {
              console.error("❌ Failed to connect MQTT:", err);
            }
          };

          initMqtt();

          return () => {
            try {
              if (client) client.end(true);
            } catch (err) {
              console.warn("MQTT cleanup error:", err);
            }
          };
        }, []);


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
          value: alertCount,
        },
      ], [alertCount]);
    
    const router = useRouter();
    const {data, isLoading, refetch} = useQuery({
      queryKey: ['bins', {type: UMBinsData}],
      queryFn: async () => {
        try{
        const { startDate, endDate } = getDateRange(isActive);
        const data = await fetchAll(startDate, endDate, isActive);
        setGridData([data.dashboardData.totalFuncBins, data.dashboardData.totalCount, data.dashboardData.totalDisposalCount, data.dashboardData.totalUMBins]);
        setChartData([data.chartsData.DBBarChartData, data.chartsData.DBPieChartData]);
        setLineChart(data.chartsData.binDisposalsTimeLine);
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
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <IoMdInformationCircleOutline className='text-xl sm:text-3xl text-[#f44336] mr-2 hover:cursor-pointer hover:animate-sway'/>
                        </DialogTrigger>
                        <DialogContent className="w-[90vw] min-h-[500px] max-h-[90vh] sm:max-w-screen-sm rounded-md flex flex-col items-center">
                          <DialogHeader className='w-full items-center'>
                            <DialogTitle>Alert Center</DialogTitle>
                            <DialogDescription>
                              Real-time statuses of bins detected as offline, full, or almost full.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end w-full mb-3 pr-2">
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600 font-medium">Sort by:</label>
                              <select
                                className="border rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={sortField}
                                onChange={(e) => setSortField(e.target.value as "capacity" | "lastSeen")}
                              >
                                <option value="capacity">Capacity</option>
                                <option value="lastSeen">Last Seen</option>
                              </select>

                              <button
                                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                                className="border rounded-md px-2 py-1 text-xs text-gray-700 hover:bg-gray-100"
                              >
                                {sortOrder === "asc" ? "▲ Asc" : "▼ Desc"}
                              </button>
                            </div>
                          </div>
                          <div className="rounded-md border w-full mt-2">
                            <div className="max-h-[400px] overflow-y-auto">
                              <Table className="w-full">
                                <TableHeader className='bg-gray-200'>
                                  <TableRow>
                                    <TableHead className="text-center font-bold">Location</TableHead>
                                    <TableHead className="text-center font-bold">Type</TableHead>
                                    <TableHead className="text-center font-bold">Capacity</TableHead>
                                    <TableHead className="text-center font-bold">Last Seen</TableHead>
                                    <TableHead className="text-center font-bold">Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {[...alertData]
                                    .sort((a, b) => {
                                      if (sortField === "capacity") {
                                        return sortOrder === "asc"
                                          ? a.capacity - b.capacity
                                          : b.capacity - a.capacity;
                                      } else if (sortField === "lastSeen") {
                                        const aTime = a.lastHeartBeat ? new Date(a.lastHeartBeat).getTime() : 0;
                                        const bTime = b.lastHeartBeat ? new Date(b.lastHeartBeat).getTime() : 0;
                                        return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
                                      }
                                      return 0;
                                    })
                                    .filter((bin, index, self) => self.findIndex(b => b.id === bin.id) === index)
                                    .map((bin, i) => (
                                      <TableRow key={i}>
                                        <TableCell className="text-center">
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <span className="truncate max-w-[120px] inline-block align-middle">
                                                  {bin.location || "-"}
                                                </span>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                {bin.location || "No location available"}
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        </TableCell>
                                        <TableCell className="text-center">{bin.material}</TableCell>
                                        <TableCell className="text-center">{bin.capacity}%</TableCell>
                                        <TableCell className="text-center text-sm text-gray-600">
                                          {bin.lastHeartBeat
                                            ? `${formatDistanceToNow(new Date(bin.lastHeartBeat))} ago`
                                            : "No signal yet"}
                                        </TableCell>
                                        <TableCell className="text-center font-bold">
                                          <div className="flex flex-col items-center gap-1">
                                            {bin.alertLevel === "offline" && (
                                              <span className="text-red-600 text-sm font-semibold">Offline</span>
                                            )}
                                            {bin.alertLevel === "online" && (
                                              <span className="text-green-600 text-sm font-semibold">Online</span>
                                            )}
                                            {bin.capacity >= 75 && bin.capacity < 100 && (
                                              <span className="text-orange-500 text-sm font-semibold">
                                                Almost Full ({bin.capacity}%)
                                              </span>
                                            )}
                                            {bin.capacity === 100 && (
                                              <span className="text-red-700 text-sm font-semibold">
                                                Full (100%)
                                              </span>
                                            )}
                                          </div>

                                          <div className="mt-2">
                                            {bin.lat && bin.long ? (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  router.push(`/admin/bin/manager/map?lat=${bin.lat}&long=${bin.long}`)
                                                }
                                              >
                                                View Location
                                              </Button>
                                            ) : (
                                              <span className="text-gray-400 text-xs">No location</span>
                                            )}
                                          </div>
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
                      {items.value !== undefined
                        ? items.value
                        : items.map
                        ? (
                          <span className="hover:cursor-pointer" onClick={() => router.push(`${items.map}`)}>
                            {gridData[index]}
                          </span>
                        )
                        : gridData[index]}
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