import React from "react";
import Chart from "@/app/admin/components/chart";
import {
  getAllBins,
  getBinCountsByMaterial,
  getBinCountsByStatus,
  getBinDisposalsByTime,
  getChartData,
  getDisposals,
} from "../action/bin";
import BinTimeChart from "./components/binTimeChart";
import StatsGrid from "./components/statsGrid";
import { BsActivity } from "react-icons/bs";
import { RiDeleteBin6Line, RiRecycleFill } from "react-icons/ri";
import { IoTrashBinSharp } from "react-icons/io5";
interface StatsData {
  color?: string;
  icon?: React.ReactNode;
  title?: string;
  value?: number;
  description?: string;
}
const Page = async () => {
  const [
    DBChartData,
    pieChartData,
    totalCount,
    totalCountByStatus,
    totalDisposalCount,
    binDisposalsTimeLine,
  ] = await Promise.all([
    getChartData(),
    getBinCountsByMaterial(),
    getAllBins(),
    getBinCountsByStatus(),
    getDisposals(),
    getBinDisposalsByTime(),
  ]);
  const binStatsData: StatsData[] = [
    {
      color: "#34b7eb",
      icon: <BsActivity className="text-xl sm:text-2xl text-[#34b7eb] mr-2" />,
      title: "Bins Status",
      value: totalCountByStatus,
      description: "Functional Bins",
    },
    {
      color: "#54666b",
      icon: (
        <RiDeleteBin6Line className="text-xl sm:text-2xl text-[#54666b] mr-2" />
      ),
      title: "Total Bins",
      value: totalCount.length,
      description: "All locations",
    },
    {
      color: "#22e38f",
      icon: (
        <RiRecycleFill className="text-xl sm:text-2xl text-[#22e38f] mr-2" />
      ),
      title: "Total Recycled Items",
      value: totalDisposalCount,
      description: "Items",
    },
    {
      color: "gray",
      icon: <IoTrashBinSharp />,
      title: "Total Waste Collected",
      value: 4,
      description: "Kg",
    },
  ];
  return (
    <div className="w-full">
      <StatsGrid statsData={binStatsData} />
      <Chart chartData={DBChartData} pieChartData={pieChartData} />
      <BinTimeChart chartData={binDisposalsTimeLine} />
    </div>
  );
};

export default Page;
