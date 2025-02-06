import React from "react";
import {
  getAllBins,
  getBinFunctionalBinsCount,
  getBinDisposalsByTime,
  getBarChartData,
  getDisposals,
  getFaultyBins,
  getPieChartData,
  getUMBinsCount,
} from "../action/bin";
import BinDashboard from "./bin/(allBinsTable)/binDashboard";
const Page = async () => {
const fetchDashboardData = async(startDate?: Date, endDate?: Date, filter?: string) => {
  "use server";
  const [
    totalFuncBins,
    totalCount,
    totalDisposalCount,
    totalUMBins,
  ] = await Promise.all([
    getBinFunctionalBinsCount(startDate, startDate,filter),
    (await getAllBins(startDate, endDate)).length,
    getDisposals(startDate, endDate),
    getUMBinsCount(startDate, endDate,filter),
  ]);

  return {
    totalFuncBins,
    totalCount,
    totalDisposalCount,
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
  };

const fetchUMBinsData = async (startDate?: Date, endDate?: Date, filter?: string) => {
  "use server";
  const UMBinsData = await getFaultyBins(startDate, endDate, filter);
  return UMBinsData;
}

const [dashboardData,chartsData,UMBinsData] = await Promise.all([fetchDashboardData(), fetchChartsData(), fetchUMBinsData()]);

const fetchAll = async (startDate?: Date, endDate?: Date, filter?: string) => {
  "use server";
  const [dashboardData, chartsData, UMBinsData] = await Promise.all([
    fetchDashboardData(startDate, endDate, filter),
    fetchChartsData(startDate, endDate, filter),
    fetchUMBinsData(startDate, endDate, filter),
  ]);
  return { dashboardData, chartsData, UMBinsData };
}

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
        DBLineChartData={chartsData.binDisposalsTimeLine} 
        initialStatsData={binStatsData} 
        UMBinsData={UMBinsData}
        fetchAll={fetchAll}/>
    </div>
    
  );
};

export default Page;
