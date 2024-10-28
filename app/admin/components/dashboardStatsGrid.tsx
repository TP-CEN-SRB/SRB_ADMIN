import React from "react";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Lilita_One, Nunito } from "next/font/google";
import { BsActivity } from "react-icons/bs";
import { MdOutlineAccessTime } from "react-icons/md";
import { GrLineChart } from "react-icons/gr";

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

const DashboardStatsGrid = () => {
  return (
    <div className="px-4 md:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {/* Bins Status Card */}
        <div className="bg-blue-100 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center">
            <BsActivity className="text-xl sm:text-2xl text-green-500 mr-2" />
            <span className={`text-lg sm:text-xl ${nunito600.className}`}>
              Bins Status
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-3xl sm:text-4xl">10</span>
            <span className={`${nunito400.className} text-sm sm:text-base`}>
              Total Bins
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
                10:28pm, 25/10/2024
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
            <span className="font-bold text-3xl sm:text-4xl">15</span>
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
            <span className="font-bold text-3xl sm:text-4xl">1,234</span>
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
  );
};

export default DashboardStatsGrid;

const navItems = [
  {
    label: "Bin Status",
  },
];
