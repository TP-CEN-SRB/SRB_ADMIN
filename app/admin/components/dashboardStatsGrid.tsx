"use client";

import React, { useState } from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Lilita_One, Nunito } from "next/font/google";
import { BsActivity } from "react-icons/bs";
import { MdOutlineAccessTime } from "react-icons/md";
import { GrLineChart } from "react-icons/gr";
import { Button } from "@/components/ui/button";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  getAllBins,
  getBinCountsByStatus,
  getDisposals,
} from "@/app/action/bin";

const lilita = Lilita_One({
  weight: "400",
  subsets: ["latin"],
});

const nunito600 = Nunito({
  weight: "600",
  subsets: ["latin"],
});

const nunito400 = Nunito({
  weight: "300",
  subsets: ["latin"],
});

interface ChartProps {
  binsCount: number;
  binsCountByStatus: number;
  disposalsCount: number;
}

const DashboardStatsGrid = ({
  binsCount,
  binsCountByStatus,
  disposalsCount,
}: ChartProps) => {
  const [loading, setLoading] = useState(false);
  const [binsStatusCount, setBinsStatusCount] = useState(binsCountByStatus);
  const [binsUpdated, setBinsUpdated] = useState(binsCount);
  const [disposals, setDisposals] = useState(disposalsCount);
  const [datetime, setDatetime] = useState(`${new Date().toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  )}, ${new Date()
    .toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .toLowerCase()}
`);

  const refreshData = async () => {
    const getAllStatsData = async () => {
      setLoading(true);
      setDatetime(`${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}, ${new Date()
        .toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
        .toLowerCase()}
      `);
      try {
        // Simulate a fetch request to get data
        setBinsUpdated((await getAllBins()).length);
        setBinsStatusCount(await getBinCountsByStatus());
        setDisposals(await getDisposals());
        console.log("Data fetched successfully!");
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    getAllStatsData();
  };
  return (
    <>
      <div className="px-4 md:px-6 lg:px-8">
        <div>
          <Button
            variant="secondary"
            className="bg-white font-bold text-gray-500 w-[200px] flex items-center justify-center"
            onClick={refreshData}
            disabled={loading}
          >
            {loading ? (
              <AiOutlineLoading3Quarters className="animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Bins Status Card */}
          <div className="bg-white rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center">
              <BsActivity className="text-xl sm:text-2xl text-green-500 mr-2" />
              <span className={`text-lg sm:text-xl ${nunito600.className}`}>
                Bins Status
              </span>
            </div>

            <div className="flex flex-col">
              <span className="font-bold text-3xl sm:text-4xl">
                {binsStatusCount}
              </span>
              <span className={`${nunito400.className} text-sm sm:text-base`}>
                Functional Bins
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col">
                <span className="font-bold text-sm sm:text-base">8 Active</span>
                <div
                  className={`flex items-center ${nunito400.className} text-xs`}
                >
                  <GrLineChart className="text-blue-500 mr-1" />
                  <span>+2.5% from last week</span>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="font-bold flex items-center">
                  <MdOutlineAccessTime className="text-lg sm:text-xl mr-1" />
                  <span className="text-sm sm:text-base">Last updated</span>
                </div>
                <span className={`${nunito400.className} text-xs`}>
                  {datetime}
                </span>
              </div>
            </div>
          </div>

          {/* Total Bins Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center">
              <RiDeleteBin6Line className="text-xl sm:text-2xl text-blue-500 mr-2" />
              <span className={`text-lg sm:text-xl ${nunito600.className}`}>
                Total Bins
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-3xl sm:text-4xl">
                {binsUpdated}
              </span>
              <span className={`${nunito400.className} text-sm sm:text-base`}>
                All Locations
              </span>
            </div>
          </div>

          {/* Total Recycled Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center">
              <RiDeleteBin6Line className="text-xl sm:text-2xl text-green-500 mr-2" />
              <span className={`text-lg sm:text-xl ${nunito600.className}`}>
                Total Recycled
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-3xl sm:text-4xl">
                {disposals}
              </span>
              <span className={`${nunito400.className} text-sm sm:text-base`}>
                Items
              </span>
            </div>
          </div>

          {/* Percentage Card */}
          <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-2">
            <div className="flex items-center">
              <GrLineChart className="text-xl sm:text-2xl text-blue-500 mr-2" />
              <span className={`text-lg sm:text-xl ${nunito600.className}`}>
                Success Rate
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-3xl sm:text-4xl">92%</span>
              <span className={`${nunito400.className} text-sm sm:text-base`}>
                Recycling Rate
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardStatsGrid;
