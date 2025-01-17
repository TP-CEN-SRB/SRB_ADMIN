"use client";

import {
  getAllBins,
  getBinCountsByMaterial,
  getBinCountsByStatus,
  getBinDisposalsByTime,
  getBarChartData,
  getDisposals,
} from "@/app/action/bin";
import React, { useEffect, useReducer, useState } from "react";
import { ChartConfig } from "@/components/ui/chart";
import StatsGrid from "../../components/statsGrid";
import Chart from "@/app/admin/components/chart";
import BinTimeChart from "../../components/binTimeChart";
import { BinStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface BinDashboardProps {
  DBBarChartData: {
    month: string;
    bin: number;
  }[];
  DBPieChartData: { binType: string; binCount: number; fill?: string }[];
  totalCount: number;
  totalFuncBins: number;
  totalDisposalCount: number;
  binDisposalsTimeLine: {
    hour: string;
    [key: string]: string | number;
  }[];
  totalUMBins: number;
}

interface DashboardState {
  barChartData: BinDashboardProps["DBBarChartData"];
  pieChartData: BinDashboardProps["DBPieChartData"];
  totalCount: BinDashboardProps["totalCount"];
  totalFuncBins: number;
  totalDisposalCount: number;
  binDisposalsTimeLine: BinDashboardProps["binDisposalsTimeLine"];
  totalUMBins: number;
  timeFilter: "week" | "month" | "year";
}

type DashboardAction =
  | { type: "SET_TIME_FILTER"; payload: "week" | "month" | "year" }
  | {
      type: "UPDATE_DATA";
      payload: {
        barChartData: BinDashboardProps["DBBarChartData"];
        pieChartData: BinDashboardProps["DBPieChartData"];
        totalCount: BinDashboardProps["totalCount"];
        totalFuncBins: number;
        totalDisposalCount: number;
        binDisposalsTimeLine: BinDashboardProps["binDisposalsTimeLine"];
        totalUMBins: number;
      };
    };

function dashboardReducer(
  state: DashboardState,
  action: DashboardAction
): DashboardState {
  switch (action.type) {
    case "SET_TIME_FILTER":
      return { ...state, timeFilter: action.payload };
    case "UPDATE_DATA":
      return {
        ...state,
        ...action.payload,
        // Provide default values to ensure type safety
        barChartData: action.payload.barChartData || state.barChartData,
        pieChartData: action.payload.pieChartData || state.pieChartData,
        totalDisposalCount:
          action.payload.totalDisposalCount ?? state.totalDisposalCount,
        totalFuncBins: action.payload.totalFuncBins ?? state.totalFuncBins,
        totalCount: action.payload.totalCount ?? state.totalCount,
        binDisposalsTimeLine:
          action.payload.binDisposalsTimeLine ?? state.binDisposalsTimeLine,
        totalUMBins: action.payload.totalUMBins ?? state.totalUMBins,
      };
    default:
      return state;
  }
}

const BinDashboard = ({
  DBBarChartData,
  DBPieChartData,
  totalFuncBins,
  totalCount,
  totalDisposalCount,
  binDisposalsTimeLine,
  totalUMBins,
}: BinDashboardProps) => {
  const [state, dispatch] = useReducer(dashboardReducer, {
    barChartData: DBBarChartData,
    pieChartData: DBPieChartData,
    totalFuncBins,
    totalCount,
    totalDisposalCount,
    binDisposalsTimeLine,
    totalUMBins,
    timeFilter: "week",
  });
  const [isActive, setIsActive] = useState("week");
  const router = useRouter();
  // useEffect(() => {
  //   const filterData = async () => {
  //     const date = new Date();

  //     const { startDate, endDate } = (() => {
  //     if (state.timeFilter == "week") {
  //       const monday = new Date(date);
  //       monday.setDate(date.getDate() - ((date.getDay() + 6) % 7)); // Get Monday
  //       monday.setHours(0, 0, 0, 0); // Set time to start of the day

  //       const sunday = new Date(monday);
  //       sunday.setDate(monday.getDate() + 6); // Get Sunday
  //       sunday.setHours(23, 59, 59, 999); // Set time to end of the day
  //       setIsActive("week");
  //       console.log(monday, sunday);
  //       return { startDate: monday, endDate: sunday };
  //     } 
  //     else if (state.timeFilter == "month") {
  //       const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
  //       startDate.setHours(0, 0, 0, 0); // Start of the month

  //       const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  //       endDate.setHours(23, 59, 59, 999); // End of the month
  //       setIsActive("month");
  //       console.log(startDate, endDate);
  //       return { startDate, endDate };
  //     } 
  //     else if (state.timeFilter == "year") {
  //       const startDate = new Date(date.getFullYear(), 0, 1);
  //       startDate.setHours(0, 0, 0, 0); // Start of the year

  //       const endDate = new Date(date.getFullYear(), 11, 31);
  //       endDate.setHours(23, 59, 59, 999); // End of the year
  //       setIsActive("year");
  //       console.log(startDate, endDate);
  //       return { startDate, endDate };
  //     }
  //       router.refresh();
  //       return { startDate: undefined, endDate: undefined };
  //   })();

  //     try {
  //       const [
  //         newBarChartData,
  //         newBinCountsByMaterial,
  //         newTotalFuncBins,
  //         newAllBins,
  //         newTotalDisposalCount,
  //         newBinDisposalsByTime,
  //         newTotalUMBins,
  //       ] = await Promise.all([
  //         getBarChartData(startDate, endDate),
  //         getBinCountsByMaterial(startDate, endDate),
  //         getBinCountsByStatus(startDate, endDate, false),
  //         getAllBins(startDate, endDate),
  //         getDisposals(startDate, endDate),
  //         getBinDisposalsByTime(startDate, endDate),
  //         getBinCountsByStatus(startDate, endDate, true),
  //       ]);

  //       // Update state with new filtered data
  //       dispatch({
  //         type: "UPDATE_DATA",
  //         payload: {
  //           barChartData: newBarChartData,
  //           pieChartData: newBinCountsByMaterial,
  //           totalFuncBins: newTotalFuncBins,
  //           totalCount: newAllBins.length,
  //           totalDisposalCount: newTotalDisposalCount,
  //           binDisposalsTimeLine: newBinDisposalsByTime,
  //           totalUMBins: newTotalUMBins,
  //           // Add other updated data as needed
  //         },
  //       });
  //     } catch (error) {
  //       console.error("Failed to fetch filtered data:", error);
  //     }
  //   };

  //   filterData();
  // }, [state.timeFilter]);

  const binStatsData = [
    state.totalFuncBins,
    state.totalCount,
    state.totalDisposalCount,
    state.totalUMBins,
  ];
  type ChartDataItem = {
    month: string;
    bin: number;
    [key: string]: string | number; // This allows for any additional string properties
  };
  const { month, bin, ...materials }: ChartDataItem = DBBarChartData[0];
  const barChartConfig = {
    binTotal: {
      label: "Total",
      color: "#0066CC",
    },
    bin: {
      label: "Bins",
      color: "#0066CC",
    },
    binToolTipLabel: {
      label: "Bins Deployed Per Month",
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
  };
  const PieChartConfig = {
    binCount: {
      label: "Count",
    },
    ...Object.entries(DBPieChartData).reduce(
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
  return (
    <div className="w-full">
      {/* <div className="flex flex-col w-full justify-center text-center items-center gap-4 py-4">
        <div className="flex rounded-lg w-1/60 border-solid border-2 border-slate-400">
          <Button
            className={`rounded-r-none hover:bg-slate-300 ${
              isActive === "week" ? "bg-gray-400" : ""
            }`}
            variant="secondary"
            onClick={() =>
              dispatch({ type: "SET_TIME_FILTER", payload: "week" })
            }
          >
            Week
          </Button>
          <div className="w-[2px] bg-slate-300" />
          <Button
            variant="secondary"
            className={`rounded-none hover:bg-slate-300 ${
              isActive === "month" ? "bg-gray-400" : ""
            }`}
            onClick={() =>
              dispatch({ type: "SET_TIME_FILTER", payload: "month" })
            }
          >
            Month
          </Button>
          <div className="w-[2px] bg-slate-300" />
          <Button
            variant="secondary"
            className={`rounded-l-none hover:bg-slate-300 ${
              isActive === "year" ? "bg-gray-400" : ""
            }`}
            onClick={() =>
              dispatch({ type: "SET_TIME_FILTER", payload: "year" })
            }
          >
            Year
          </Button>
        </div>
      </div> */}
      {/* <StatsGrid initialStatsData={binStatsData}/> */}
      {/* <StatsGrid initialStatsData={[totalFuncBins, totalCount, totalDisposalCount, totalUMBins]}/> */}
      {/* <Chart
        chartData={state.barChartData}
        pieChartData={state.pieChartData}
        barChartConfig={barChartConfig}
        pieChartConfig={PieChartConfig}
      />
      <BinTimeChart
        chartData={state.binDisposalsTimeLine}
        binTimeLineChartConfig={binDisposalsTimeLineConfig}
      /> */}
    </div>
  );
};

//export default BinDashboard;
