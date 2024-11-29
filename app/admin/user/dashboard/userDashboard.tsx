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

const UsersDashboard = () => {
  return (
    <div className="p-4 w-full">
      <div className="flex flex-col w-full justify-center text-center items-center gap-4 py-4">
        <h1 className="text-4xl font-bold">Leaderboard</h1>
        <div className="flex rounded-lg w-1/60 border-solid border-2 border-slate-400">
          <Button
            className="rounded-r-none hover:bg-slate-300"
            variant="secondary"
          >
            Week
          </Button>
          <div className="w-[2px] bg-slate-300" /> {/* Separator */}
          <Button
            variant="secondary"
            className="hover:bg-slate-300 rounded-none"
          >
            Month
          </Button>
          <div className="w-[2px] bg-slate-300" /> {/* Separator */}
          <Button
            variant="secondary"
            className="hover:bg-slate-300 rounded-l-none"
          >
            Year
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {LeaderboardItems.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md flex flex-col relative w-full max-w-md"
          >
            {/* Gradient background header */}
            <div
              className={`flex justify-end w-full h-40 bg-gradient-to-tr from-white ${item.toColour} px-4 rounded-t-lg`}
            >
              <Image
                src={item.image}
                alt={`${item.altImage}`}
                className="h-32 w-28"
              />
            </div>

            {/* Profile picture container */}
            <div className="absolute top-24 left-8">
              <div className="w-28 h-28 bg-white rounded-full shadow-md"></div>
            </div>

            {/* Content area */}
            <div className=" ml-8 mt-2 mb-4 h-20 flex justify-start items-end">
              <span className="text-3xl font-bold">{item.name}</span>
            </div>
            {/* Data */}
            <div className="flex w-full px-8 justify-between mb-8 flex-wrap">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{item.disposals}</span>
                <span className="text-sm">Disposals</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{item.points}</span>
                <span className="text-sm">Points</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold">{item.redemptions}</span>
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
