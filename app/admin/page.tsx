import React, { Suspense } from "react";
import {
  getAllBins,
  getBinCountsByMaterial,
  getBinCountsByStatus,
  getChartData,
  getDisposals,
} from "../action/bin";
import DashboardStatsGrid from "./components/dashboardStatsGrid";
import Chart from "./components/chart";
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const Page = async () => {
  // await delay(5000);
  const [
    DBChartData,
    pieChartData,
    totalCount,
    totalCountByStatus,
    totalDisposalCount,
  ] = await Promise.all([
    getChartData(),
    getBinCountsByMaterial(),
    getAllBins(),
    getBinCountsByStatus(),
    getDisposals(),
  ]);
  return (
    <div className="p-4">
      <DashboardStatsGrid
        binsCount={totalCount.length}
        binsCountByStatus={totalCountByStatus}
        disposalsCount={totalDisposalCount}
      />
      <Chart chartData={DBChartData} pieChartData={pieChartData} />
    </div>
  );
};

export default Page;
