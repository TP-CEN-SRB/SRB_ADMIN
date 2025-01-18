import React from "react";
import {
  getAllBins,
  getBinCountsByMaterial,
  getBinCountsByStatus,
  getBinDisposalsByTime,
  getBarChartData,
  getDisposals,
} from "../action/bin";
import BinDashboardUpdate from "./bin/(allBinsTable)/binDashboard-update";
const Page = async () => {
  const fetchDashboardData = async (
    startDate?: Date,
    endDate?: Date,
    filter?: string
  ) => {
    "use server";
    const [
      // DBBarChartData,
      DBPieChartData,
      totalFuncBins,
      totalCount,
      totalDisposalCount,
      binDisposalsTimeLine,
      totalUMBins,
    ] = await Promise.all([
      // getBarChartData(startDate, endDate,filter),
      getBinCountsByMaterial(startDate, endDate),
      getBinCountsByStatus(startDate, startDate, false),
      (await getAllBins(startDate, endDate)).length,
      getDisposals(startDate, endDate),
      getBinDisposalsByTime(startDate, endDate),
      getBinCountsByStatus(startDate, endDate, true),
    ]);

    return {
      // DBBarChartData,
      DBPieChartData,
      totalFuncBins,
      totalCount,
      totalDisposalCount,
      binDisposalsTimeLine,
      totalUMBins,
    };
  };

  const fetchChartsData = async (
    startDate?: Date,
    endDate?: Date,
    filter?: string
  ) => {
    "use server";
    const [DBBarChartData, DBPieChartData, binDisposalsTimeLine] =
      await Promise.all([
        getBarChartData(startDate, endDate, filter),
        getBinCountsByMaterial(startDate, endDate),
        getBinDisposalsByTime(startDate, endDate),
      ]);

    return {
      DBBarChartData,
      DBPieChartData,
      binDisposalsTimeLine,
    };
  };

  const dashboardData = await fetchDashboardData();
  const chartsData = await fetchChartsData();

  const binStatsData = [
    dashboardData.totalFuncBins,
    dashboardData.totalCount,
    dashboardData.totalDisposalCount,
    dashboardData.totalUMBins,
  ];
  type ChartDataItem = {
    month: string;
    bin: number;
    [key: string]: string | number; // This allows for any additional string properties
  };
  const { month, bin, ...materials }: ChartDataItem =
    chartsData.DBBarChartData[0];

  return (
    <div className="w-full">
      {/* <StatsGrid initialStatsData={binStatsData} />
      <Chart
        chartData={DBBarChartData}
        pieChartData={DBPieChartData}
        barChartConfig={barChartConfig}
        pieChartConfig={PieChartConfig}
      />
      <BinTimeChart
        chartData={binDisposalsTimeLine}
        binTimeLineChartConfig={binDisposalsTimeLineConfig}
      /> */}
      {/* to be fixed - written on 30/12/2024 */}
      {/* <BinDashboard
        DBBarChartData={DBBarChartData}
        DBPieChartData={DBPieChartData}
        totalFuncBins={totalFuncBins}
        totalCount={totalCount}
        totalDisposalCount={totalDisposalCount}
        binDisposalsTimeLine={binDisposalsTimeLine}
        totalUMBins={totalUMBins}
      /> */}
      {/* <StatsGrid initialStatsData={binStatsData} fetchData={fetchDashboardData} /> */}
      <BinDashboardUpdate
        DBBarChartData={chartsData.DBBarChartData}
        DBPieChartData={chartsData.DBPieChartData}
        DBLineChartData={dashboardData.binDisposalsTimeLine}
        initialStatsData={binStatsData}
        fetchData={fetchDashboardData}
        fetchChartsData={fetchChartsData}
      />
    </div>
  );
};

export default Page;
