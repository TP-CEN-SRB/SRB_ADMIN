import React from "react";
import Chart from "@/app/admin/components/chart";
import {
  getAllBins,
  getBinCountsByMaterial,
  getBinCountsByStatus,
  getBinDisposalsByTime,
  getPieChartData,
  getDisposals,
} from "../action/bin";
import BinTimeChart from "./components/binTimeChart";
import StatsGrid from "./components/statsGrid";
import { ChartConfig } from "@/components/ui/chart";
interface StatsData {
  color?: string;
  icon?: React.ReactNode;
  title?: string;
  value?: number;
  description?: string;
}
const Page = async () => {
  const [
    DBBarChartData,
    DBPieChartData,
    totalCount,
    totalFuncBins,
    totalDisposalCount,
    binDisposalsTimeLine,
    totalUMBins,
  ] = await Promise.all([
    getPieChartData(),
    getBinCountsByMaterial(),
    getAllBins(),
    getBinCountsByStatus(),
    getDisposals(),
    getBinDisposalsByTime(),
    getBinCountsByStatus(undefined, undefined, true),
  ]);

  const binStatsData = [
    totalFuncBins,
    totalDisposalCount,
    totalCount.length,
    totalUMBins,
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
      <StatsGrid initialStatsData={binStatsData} />
      <Chart
        chartData={DBBarChartData}
        pieChartData={DBPieChartData}
        barChartConfig={barChartConfig}
        pieChartConfig={PieChartConfig}
      />
      <BinTimeChart
        chartData={binDisposalsTimeLine}
        binTimeLineChartConfig={binDisposalsTimeLineConfig}
      />
    </div>
  );
};

export default Page;
