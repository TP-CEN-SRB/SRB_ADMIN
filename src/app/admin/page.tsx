import React from "react";
import {
  getAllBins,
  getBinDisposalsByTime,
  getBarChartData,
  getDisposals,
  getFaultyBins,
  getPieChartData,
  getBinCountsByStatus,
  getHeartbeat,
} from "../action/bin";
import BinDashboard from "./bin/(allBinsTable)/binDashboard";
const Page = async () => {
const fetchDashboardData = async (startDate?: Date, endDate?: Date, filter?: string) => {
  "use server";

  // 🟢 Fetch heartbeat data for all bins
  const heartbeatData = await getHeartbeat();

  // 🧠 Compute hybrid status
  const totalFuncBins = heartbeatData.filter(
    (b) => b.effectiveStatus === "FUNCTIONAL"
  ).length;

  const totalUMBins = heartbeatData.filter(
    (b) => b.effectiveStatus === "UNDER_MAINTENANCE"
  ).length;

  const totalCount = heartbeatData.length;

  // 🗑️ Disposal count can stay as before
  const totalDisposalCount = await getDisposals(startDate, endDate);

  return {
    totalFuncBins,
    totalCount,
    totalDisposalCount,
    totalUMBins,
  };
};


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
