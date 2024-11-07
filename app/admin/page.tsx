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
  const DBChartData = await getChartData();
  const pieChartData = await getBinCountsByMaterial();
  const totalCount = await getAllBins();
  const totalCountByStatus = await getBinCountsByStatus();
  const totalDisposalCount = await getDisposals();
  return (
    <div className="w-full p-4">
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
