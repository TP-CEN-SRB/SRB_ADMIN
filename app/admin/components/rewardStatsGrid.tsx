import { Nunito } from "next/font/google";
import React from "react";
import { BsActivity } from "react-icons/bs";
import { GrLineChart } from "react-icons/gr";
import { MdOutlineAccessTime } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { LuTrophy } from "react-icons/lu";
import { MdCardGiftcard } from "react-icons/md";
import { BsPeople } from "react-icons/bs";

const nunito600 = Nunito({
  weight: "600",
  subsets: ["latin"],
});

const nunito400 = Nunito({
  weight: "300",
  subsets: ["latin"],
});

const RewardStatsGrid = () => {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Redemptions Made */}
        <div className="bg-white rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center">
            <LuTrophy className="text-xl sm:text-2xl text-yellow-500 mr-2" />
            <span className={`text-lg sm:text-xl ${nunito600.className}`}>
              Total Rewards Distributed
            </span>
          </div>

          <div className="flex flex-col">
            <span className="font-bold text-3xl sm:text-4xl">1</span>
            <span className={`${nunito400.className} text-sm sm:text-base`}>
              Redemptions made
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base">8 Counts</span>
              <div
                className={`flex items-center ${nunito400.className} text-xs`}
              >
                <GrLineChart className="text-blue-500 mr-1" />
                <span>+2.5% from last month</span>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="font-bold flex items-center">
                <MdOutlineAccessTime className="text-lg sm:text-xl mr-1" />
                <span className="text-sm sm:text-base">Last updated</span>
              </div>
              <span className={`${nunito400.className} text-xs`}>
                2 hours ago
              </span>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center">
            <BsPeople className="text-xl sm:text-2xl text-gray-500 mr-2" />
            <span className={`text-lg sm:text-xl ${nunito600.className}`}>
              Total Active Users
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-3xl sm:text-4xl">100</span>
            <span className={`${nunito400.className} text-sm sm:text-base`}>
              Users
            </span>
          </div>
        </div>

        {/* Top Rewards */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-2">
          <div className="flex items-center">
            <MdCardGiftcard className="text-xl sm:text-2xl text-green-500 mr-2" />
            <span className={`text-lg sm:text-xl ${nunito600.className}`}>
              Top Rewards
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-3xl sm:text-4xl"></span>
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
              Points Redeemed
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-3xl sm:text-4xl">92%</span>
            <span className={`${nunito400.className} text-sm sm:text-base`}>
              Redeemed
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default RewardStatsGrid;
