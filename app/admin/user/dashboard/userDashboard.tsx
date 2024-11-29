"use client";

import React from "react";
import Firsticon from "../../../../public/first_icon.png";
import Secondicon from "../../../../public/second_icon.png";
import Thirdicon from "../../../../public/third_icon.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const LeaderboardItems = [
  {
    image: Firsticon,
    altImage: "First Icon",
    toColour: "to-yellow-200",
    name: "User A",
    disposals: 10,
    points: 10,
    redemptions: 10,
  },
  {
    image: Secondicon,
    altImage: "Second Icon",
    toColour: "to-slate-400",
    name: "User B",
    disposals: 10,
    points: 10,
    redemptions: 10,
  },
  {
    image: Thirdicon,
    altImage: "Third Icon",
    name: "User C",
    toColour: "to-yellow-700",
    disposals: 10,
    points: 10,
    redemptions: 10,
  },
];

interface leaderBoardData {
  username: string | undefined;
  userId: string | undefined;
  balance: number;
  disposalCount: number;
  redemptionCount: number | { _count: { id: number } };
}

interface userDashboardProps {
  leaderBoardData: leaderBoardData[];
}

const UsersDashboard = ({ leaderBoardData }: userDashboardProps) => {
  const topThree = leaderBoardData.slice(0, 3);
  const [isActive, setIsActive] = React.useState("week");
  const [filterChange, setFilterChange] = React.useState(false);
  return (
    <div className="p-4 w-full">
      <div className="flex flex-col w-full justify-center text-center items-center gap-4 py-4">
        <h1 className="text-4xl font-bold">Leaderboard</h1>
        <div className="flex rounded-lg w-1/60 border-solid border-2 border-slate-400">
          <Button
            className={`rounded-r-none hover:bg-slate-300 ${
              isActive == "week" ? "bg-gray-400" : ""
            }`}
            variant="secondary"
            onClick={() => setIsActive("week")}
          >
            Week
          </Button>
          <div className="w-[2px] bg-slate-300" /> {/* Separator */}
          <Button
            variant="secondary"
            className={`rounded-none hover:bg-slate-300 ${
              isActive == "month" ? "bg-gray-400" : ""
            }`}
            onClick={() => (setIsActive("month"), setFilterChange(true))}
          >
            Month
          </Button>
          <div className="w-[2px] bg-slate-300" /> {/* Separator */}
          <Button
            variant="secondary"
            className={`rounded-l-none hover:bg-slate-300 ${
              isActive == "year" ? "bg-gray-400" : ""
            }`}
            onClick={() => setIsActive("year")}
          >
            Year
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {topThree.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md flex flex-col relative w-full max-w-md"
          >
            {/* Gradient background header */}
            <div
              className={`flex justify-end w-full h-40 bg-gradient-to-tr from-white ${LeaderboardItems[index].toColour} px-4 rounded-t-lg`}
            >
              <Image
                src={LeaderboardItems[index].image}
                alt={`${LeaderboardItems[index].altImage}`}
                className="h-32 w-28"
              />
            </div>

            {/* Profile picture container */}
            <div className="absolute top-24 left-8">
              <div className="w-28 h-28 bg-white rounded-full shadow-md flex justify-center items-center text-center">
                <span className="text-4xl font-bold">
                  {item.username?.split("", 1)}
                </span>
              </div>
            </div>

            {/* Content area */}
            <div className=" ml-8 mt-2 mb-4 h-20 flex justify-start items-end">
              <span className="text-3xl font-bold">{item.username}</span>
            </div>
            {/* Data */}
            <div className="flex w-full px-8 justify-between mb-8 flex-wrap">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{item.disposalCount}</span>
                <span className="text-sm">Disposals</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{item.balance}</span>
                <span className="text-sm">Points</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {item.redemptionCount.toString()}
                </span>
                <span className="text-sm">Redemptions</span>
              </div>
            </div>
            {/* View Profile */}
            <div className="flex justify-center items-center h-12 mx-4 mb-4 bg-blue-300 rounded-lg">
              <button className="text-white font-bold py-2 px-4 rounded-lg w-full h-full">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersDashboard;
