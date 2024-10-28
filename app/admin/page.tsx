"use client";

import React from "react";
import Header from "./header";
import DashboardStatsGrid from "./components/dashboardStatsGrid";
import BinChart from "./components/piechart";
import Card from "@/components/Card/Card";

const Page = () => {
  return (
    <div className="w-screen ">
      <DashboardStatsGrid />
      {/* <div className="grid grid-rows-2 grid-cols-2 w-full h-20 m-4 sm:grid-cols-1 sm:grid-rows-4">
        {/* <div className="col-start-1 col-span-2">Total Bins By Month</div>
        <div className="col-start-1 sm:col-span-1 sm:row-start-2">
          <BinChart />
        </div>
      </div> */}
    </div>
  );
};

export default Page;
