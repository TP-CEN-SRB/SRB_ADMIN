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
import { ChartConfig } from "@/components/ui/chart";
import Chart from "../../components/chart";
import BinTimeChart from "../../components/binTimeChart";
import { BarChartConfig } from "./chartConfigs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Loading from "@/app/(bin)/loading";
import { DateRange } from "@/utils/dateUtils";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { truncateText } from "@/utils/truncateString";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ConfirmResolveBinIssueDialog from "@/components/Dialog/ConfirmResolveBinIssueDialog";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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
      location: string | null;
    };
    binMaterial: {
      name: string;
    };
  }[];
  fetchData: (
    startDate: Date,
    endDate: Date
  ) => Promise<{
    DBPieChartData: { fac: string; count: number; fill: string }[];
    totalFuncBins: number;
    totalCount: number;
    totalDisposalCount: number;
    binDisposalsTimeLine: { hour: string; [key: string]: string | number }[];
    totalUMBins: number;
  }>;
  fetchChartsData: (
    startDate: Date,
    endDate: Date,
    filter?: string
  ) => Promise<{
    DBBarChartData: {
      month: string;
      bin: number;
    }[];
    DBPieChartData: { fac: string; count: number; fill: string }[];
    binDisposalsTimeLine: { hour: string; [key: string]: string | number }[];
  }>;
  fetchUMBinsData: (
    startDate?: Date,
    endDate?: Date,
    filter?: string
  ) => Promise<
    {
      id: string;
      user: {
        location: string | null;
      };
      binMaterial: {
        name: string;
      };
    }[]
  >;
}
type FilterPeriod = "all time" | "week" | "month" | "year";
type ChartDataItem = {
  month: string;
  bin: number;
  [key: string]: string | number; // This allows for any additional string properties
};

const BinDashboard = ({
  DBBarChartData,
  DBPieChartData,
  DBLineChartData,
  initialStatsData,
  UMBinsData,
  fetchData,
  fetchChartsData,
  fetchUMBinsData,
}: BinDashboardProps) => {
  const [isActive, setIsActive] = useState<FilterPeriod>("all time");
  const [isLoading, setIsLoading] = useState(false);
  const [gridData, setGridData] = useState<number[]>(initialStatsData);
  const [chartData, setChartData] = useState<
    [typeof DBBarChartData, typeof DBPieChartData]
  >([DBBarChartData, DBPieChartData]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [binId, setBinId] = useState<string>("");
  const [isResolved, setIsResolved] = useState(false);
  const [UMBinsTable, setUMBinsTable] = useState(UMBinsData);
  const [lineChart, setLineChart] = useState(DBLineChartData);

  const datetime = formatDateTime(new Date());
  const { month, bin, ...materials }: ChartDataItem = DBBarChartData[0];
  const barChartConfig = BarChartConfig({ materials }) as ChartConfig;
  // const pieChartConfig = PieChartConfig({ DBPieChartData }) as ChartConfig;
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

  const handlePeriodChange = useCallback(
    async (period: FilterPeriod) => {
      setIsLoading(true);
      try {
        const { startDate, endDate } = getDateRange(period);
        if (startDate && endDate) {
          const { totalFuncBins, totalCount, totalDisposalCount, totalUMBins } =
            await fetchData(startDate, endDate);
          const { DBBarChartData, DBPieChartData, binDisposalsTimeLine } =
            await fetchChartsData(startDate, endDate, period);
          setGridData([
            totalFuncBins,
            totalCount,
            totalDisposalCount,
            totalUMBins,
          ]);
          setChartData([DBBarChartData, DBPieChartData]);
          setLineChart(binDisposalsTimeLine);
        } else {
          setGridData(initialStatsData);
          setChartData([DBBarChartData, DBPieChartData]);
          setLineChart(DBLineChartData);
        }
      } catch (error) {
        console.log(error);
        toast({
          title: "Error!",
          description: "Failed to fetch data",
          duration: 2000,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [getDateRange]
  );

  useEffect(() => {
    const updateUMBinsTable = async () => {
      if (isResolved) {
        setIsLoading(true);
        try {
          const UMBinsUpdate = await fetchUMBinsData();

          setUMBinsTable(UMBinsUpdate);
          setIsResolved(false); // Reset the resolved state after fetching data
        } catch (error) {
          console.log("Error updating bin status", error);
          toast({
            title: "Error!",
            description: "Failed to update bin status",
            duration: 2000,
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    updateUMBinsTable();
  }, [isResolved, fetchUMBinsData]);

  const binDashBoardItems = useMemo(
    () => [
      {
        color: "#34b7eb",
        icon: (
          <BsActivity className="text-xl sm:text-2xl text-[#34b7eb] mr-2" />
        ),
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
        map: "/admin/bin/manager/map",
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
    ],
    [gridData]
  );

  const router = useRouter();
  // const intervalId = setInterval(() => {
  //   router.push("/admin") // Refreshes the current page
  //   console.log("Page Refreshed", new Date());
  // }, 3600000); // Refresh every 5 seconds

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <ConfirmResolveBinIssueDialog
            binId={binId}
            isOpen={isDeleteDialogOpen}
            handleDialogOpen={() => setIsDeleteDialogOpen(!isDeleteDialogOpen)}
            isResolved={isResolved}
            handleResolved={() => setIsResolved(!isResolved)}
          />
          <div className="px-4 md:px-6 lg:px-8 mt-4">
            <div className="flex flex-row md:items-center justify-between">
              <span className="text-gray-600 text-sm sm:text-base">
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
                  {(
                    ["all time", "week", "month", "year"] as FilterPeriod[]
                  ).map((period) => (
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
                        <div className="flex gap-2">
                          <span style={{ color: data.color }}>{data.icon}</span>
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
                              <IoMdInformationCircleOutline className="text-xl sm:text-3xl text-[#f44336] mr-2 hover:cursor-pointer hover:animate-sway" />
                            </DialogTrigger>
                            <DialogContent className="w-[90vw] min-h-[500px] max-h-[90vh] sm:max-w-screen-sm rounded-md flex flex-col items-center">
                              <DialogHeader className="w-full items-center">
                                <DialogTitle>
                                  Bins Under Maintenance
                                </DialogTitle>
                                <DialogDescription>
                                  Update the status of the bin. Click resolve if
                                  issue has been corrected.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="rounded-md border w-full">
                                <div className="max-h-[400px] overflow-y-auto">
                                  <Table className="w-full">
                                    <TableHeader>
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
                                      {UMBinsTable.map((bin, index) => (
                                        <TableRow key={index}>
                                          <TableCell className="text-center">
                                            <Tooltip>
                                              <TooltipTrigger>
                                                {truncateText(
                                                  bin.user.location as string,
                                                  10
                                                )}
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                {bin.user.location}
                                              </TooltipContent>
                                            </Tooltip>
                                          </TableCell>
                                          <TableCell className="text-center">
                                            {bin.binMaterial.name.length >
                                            10 ? (
                                              <>
                                                <TooltipProvider>
                                                  <Tooltip>
                                                    <TooltipTrigger>
                                                      {truncateText(
                                                        bin.binMaterial
                                                          .name as string,
                                                        10
                                                      )}
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                      {bin.binMaterial.name}
                                                    </TooltipContent>
                                                  </Tooltip>
                                                </TooltipProvider>
                                              </>
                                            ) : (
                                              bin.binMaterial.name
                                            )}
                                          </TableCell>
                                          <TableCell className="text-center">
                                            <Button
                                              className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-600"
                                              variant="secondary"
                                              onClick={() => (
                                                setIsDeleteDialogOpen(
                                                  !isDeleteDialogOpen
                                                ),
                                                setBinId(bin.id)
                                              )}
                                            >
                                              Resolved
                                            </Button>
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
                          {data.map ? (
                            <span
                              className="hover:cursor-pointer"
                              onClick={() => router.push(`${data.map}`)}
                            >
                              {data.value}
                            </span>
                          ) : (
                            data.value
                          )}
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
            barChartConfig={barChartConfig}
          />
          <BinTimeChart
            chartData={lineChart}
            binTimeLineChartConfig={binDisposalsTimeLineConfig}
          />
        </>
      )}
    </>
  );
};

export default BinDashboard;
