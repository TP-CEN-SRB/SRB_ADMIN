"use client";

import React, { useReducer } from "react";
import Firsticon from "../../../../public/first_icon.png";
import Secondicon from "../../../../public/second_icon.png";
import Thirdicon from "../../../../public/third_icon.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getTopTenUsers } from "@/app/action/user";

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

interface IState {
  updatedLeaderBoardData: leaderBoardData[];
}

interface IAction {
  type: string;
  values: leaderBoardData[];
}

const UsersDashboard = ({ leaderBoardData }: userDashboardProps) => {
  const [isActive, setIsActive] = React.useState("week");
  const initialState: IState = {
    updatedLeaderBoardData: leaderBoardData,
  };
  const statsReducer = (state: IState, action: IAction) => {
    switch (action.type) {
      case "week":
        return {
          ...state,
          updatedLeaderBoardData: action.values,
        };
      case "month":
        return {
          ...state,
          updatedLeaderBoardData: action.values,
        };
      case "year":
        return {
          ...state,
          updatedLeaderBoardData: action.values,
        };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(statsReducer, {
    updatedLeaderBoardData: leaderBoardData.slice(0, 3),
  });

  const dateFilter = async (filterValue: string) => {
    const date = new Date();
    switch (filterValue) {
      case "week": {
        const firstDayofWeek = new Date(
          date.setDate(date.getDate() - date.getDay())
        );
        const lastDayofWeek = new Date(
          date.setDate(date.getDate() - date.getDay() + 6)
        );
        const weeklyFilter = await fetchDataBasedOnDateRange(
          firstDayofWeek,
          lastDayofWeek
        );
        dispatch({ type: "week", values: weeklyFilter });
        break;
      }
      case "month": {
        const firstDayofMonth = new Date(
          date.getFullYear(),
          date.getMonth(),
          1
        );
        const lastDayofMonth = new Date(
          date.getFullYear(),
          date.getMonth() + 1,
          0
        );
        const monthlyFilter = await fetchDataBasedOnDateRange(
          firstDayofMonth,
          lastDayofMonth
        );
        dispatch({ type: "month", values: monthlyFilter });
        break;
      }
      case "year": {
        const firstDayofYear = new Date(date.getFullYear(), 0, 1);
        const lastDayofYear = new Date(date.getFullYear(), 11, 31);
        const yearlyFilter = await fetchDataBasedOnDateRange(
          firstDayofYear,
          lastDayofYear
        );
        dispatch({ type: "year", values: yearlyFilter });
        break;
      }
    }
  };

  const fetchDataBasedOnDateRange = async (
    dateFrom: Date,
    dateTo: Date
  ): Promise<leaderBoardData[]> => {
    const updatedLeaderboardArr = await getTopTenUsers(dateFrom, dateTo);
    return updatedLeaderboardArr;
  };

  const topThree = state.updatedLeaderBoardData.slice(0, 3);
  const rest = state.updatedLeaderBoardData.slice(3);
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
            onClick={() => (setIsActive("week"), dateFilter("week"))}
          >
            Week
          </Button>
          <div className="w-[2px] bg-slate-300" /> {/* Separator */}
          <Button
            variant="secondary"
            className={`rounded-none hover:bg-slate-300 ${
              isActive == "month" ? "bg-gray-400" : ""
            }`}
            onClick={() => (setIsActive("month"), dateFilter("month"))}
          >
            Month
          </Button>
          <div className="w-[2px] bg-slate-300" /> {/* Separator */}
          <Button
            variant="secondary"
            className={`rounded-l-none hover:bg-slate-300 ${
              isActive == "year" ? "bg-gray-400" : ""
            }`}
            onClick={() => (setIsActive("year"), dateFilter("year"))}
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
