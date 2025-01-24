import React from "react";
import {
  getAllBins,
  getBinCountsByStatus,
  getBinDisposalsByTime,
  getBarChartData,
  getDisposals,
  getFaultyBins,
  getPieChartData,
} from "../action/bin";
import BinDashboard from "./bin/(allBinsTable)/binDashboard";
const Page = async () => {
const fetchDashboardData = async(startDate?: Date, endDate?: Date, filter?: string) => {
  "use server";
  const [
    DBPieChartData,
    totalFuncBins,
    totalCount,
    totalDisposalCount,
    binDisposalsTimeLine,
    totalUMBins,
  ] = await Promise.all([
    getPieChartData(startDate, endDate, filter),
    getBinCountsByStatus(startDate, startDate, false),
    (await getAllBins(startDate, endDate)).length,
    getDisposals(startDate, endDate),
    getBinDisposalsByTime(startDate, endDate, filter),
    getBinCountsByStatus(startDate, endDate, true),
  ]);

  return {
    DBPieChartData,
    totalFuncBins,
    totalCount,
    totalDisposalCount,
    binDisposalsTimeLine,
    totalUMBins,
  };
}

const fetchChartsData = async (startDate?: Date, endDate?: Date, filter?: string) => {
  "use server";
  const [
    DBBarChartData,
    DBPieChartData,
    binDisposalsTimeLine,
  ] = await Promise.all([
    getBarChartData(startDate, endDate, filter),
    getPieChartData(startDate, endDate, filter),
    getBinDisposalsByTime(startDate, endDate, filter),
  ]);

  return {
    DBBarChartData,
    DBPieChartData,
    binDisposalsTimeLine,
  };
}

const fetchUMBinsData = async (startDate?: Date, endDate?: Date, filter?: string) => {
  "use server";
  const UMBinsData = await getFaultyBins(startDate, endDate, filter);
  return UMBinsData;
}

const [dashboardData,chartsData,UMBinsData] = await Promise.all([fetchDashboardData(), fetchChartsData(), fetchUMBinsData()]);

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
const { month, bin, ...materials }: ChartDataItem = chartsData.DBBarChartData[0];

  return (
    <div className="w-full">
      <BinDashboard 
        DBBarChartData={chartsData.DBBarChartData} 
        DBPieChartData={chartsData.DBPieChartData} 
        DBLineChartData={dashboardData.binDisposalsTimeLine} 
        initialStatsData={binStatsData} 
        UMBinsData={UMBinsData}
        fetchData={fetchDashboardData} 
        fetchChartsData={fetchChartsData}
        fetchUMBinsData={fetchUMBinsData}/>
    </div>
    
  );
};

export default Page;
