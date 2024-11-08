import React from "react";
import DashboardStatsGrid from "./components/dashboardStatsGrid";
import { Chart } from "./components/chart";
import {
  getAllBins,
  getBinCountsByMaterial,
  getBinCountsByStatus,
  getChartData,
  getDisposals,
} from "../action/bin";

const Page = async () => {
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
