"use client";

import React, { useEffect, useState } from "react";
import Firsticon from "../../../../public/first_icon.png";
import Secondicon from "../../../../public/second_icon.png";
import Thirdicon from "../../../../public/third_icon.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getTopHundredUsers } from "@/app/action/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaArrowRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { getNameInitials } from "@/utils/getNameInitials";

type User = {
  username: string | undefined;
  userId: string | undefined;
  balance: number;
  disposalCount: number;
  redemptionCount: number | { _count: { id: number } };
  mostFrequentMaterial: string | undefined;
};

interface LeaderboardData {
  username: string | undefined;
  userId: string | undefined;
  balance: number;
  disposalCount: number;
  redemptionCount: number | { _count: { id: number } };
  mostFrequentMaterial: string | undefined;
}

const UsersDashboard = ({
  leaderBoardData,
}: {
  leaderBoardData: LeaderboardData[];
}) => {
  const router = useRouter();
  const columns: ColumnDef<User>[] = [
    { id: "username", header: "Username", accessorKey: "username" },
    { id: "balance", header: "Points", accessorKey: "balance" },
    {
      id: "disposalCount",
      header: "Disposal Count",
      accessorKey: "disposalCount",
    },
    {
      id: "redemptionCount",
      header: "Redemption Count",
      accessorKey: "redemptionCount",
    },
    {
      id: "mostFrequentMaterial",
      header: "Most thrown Material",
      accessorKey: "mostFrequentMaterial",
    },
    {
      id: "actions",
      header: "View",
      cell: ({ row }) => {
        return (
          <button
            className="flex bg-blue-500 hover:bg-blue-300 justify-center items-center text-white font-bold py-2 px-4 rounded-lg w-auto h-full"
            onClick={() => router.push(`/admin/student/${row.original.userId}`)}
          >
            View Profile
            <FaArrowRight className="ml-2" />
          </button>
        );
      },
    },
  ];
  const [isActive, setIsActive] = useState("week");
  const [leaderBoard, setLeaderBoard] =
    useState<LeaderboardData[]>(leaderBoardData);
  const [tableData, setTableData] = useState<LeaderboardData[]>([]);

  // useEffect(() => {
  //   const filterData = async () => {
  //     const date = new Date();

  //     const { startDate, endDate } = (() => {
  //       if (isActive === "week") {
  //         return {
  //           startDate: new Date(
  //             date.setDate(date.getDate() - date.getDay() - 6)
  //           ),
  //           endDate: new Date(date.setDate(date.getDate() - date.getDay() + 7)),
  //         };
  //       } else if (isActive === "month") {
  //         return {
  //           startDate: new Date(date.getFullYear(), date.getMonth(), 1),
  //           endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
  //         };
  //       } else if (isActive === "year") {
  //         return {
  //           startDate: new Date(date.getFullYear(), 0, 1),
  //           endDate: new Date(date.getFullYear(), 11, 31),
  //         };
  //       }
  //       return { startDate: new Date(), endDate: new Date() };
  //     })();

  //     try {
  //       const filteredData = await getTopHundredUsers(startDate, endDate);
  //       setLeaderBoard(filteredData);
  //     } catch (error) {
  //       console.error("Failed to fetch leaderboard data:", error);
  //     }
  //   };
  //   filterData();
  // }, [isActive]);

  useEffect(() => {
    const rest = leaderBoard.slice(3);
    setTableData(rest);
  }, [leaderBoard]);

  const topThree = leaderBoard.slice(0, 3);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-4 w-full">
      <div className="flex flex-col w-full justify-center text-center items-center gap-4 py-4">
        <h1 className="text-4xl font-bold">Leaderboard</h1>
        <div className="flex rounded-lg w-1/60 border-solid border-2 border-slate-400">
          <Button
            className={`rounded-r-none hover:bg-gray-300 ${
              isActive === "week" ? "bg-gray-400" : ""
            }`}
            variant="secondary"
            onClick={() => setIsActive("week")}
          >
            Week
          </Button>
          <div className="w-[2px] bg-slate-300" />
          <Button
            variant="secondary"
            className={`rounded-none hover:bg-gray-300 ${
              isActive === "month" ? "bg-gray-400" : ""
            }`}
            onClick={() => setIsActive("month")}
          >
            Month
          </Button>
          <div className="w-[2px] bg-slate-300" />
          <Button
            variant="secondary"
            className={`rounded-l-none hover:bg-gray-300 ${
              isActive === "year" ? "bg-gray-400" : ""
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
            <div
              className={`flex justify-end w-full h-40 bg-gradient-to-tr from-white ${
                index == 0
                  ? "to-yellow-200"
                  : index == 1
                  ? "to-slate-400"
                  : "to-yellow-700"
              } px-4 rounded-t-lg`}
            >
              <Image
                src={
                  index === 0 ? Firsticon : index === 1 ? Secondicon : Thirdicon
                }
                alt={`Icon ${index + 1}`}
                className="h-32 w-28"
              />
            </div>
            <div className="absolute top-24 left-8">
              <div className="w-28 h-28 bg-white rounded-full shadow-md flex justify-center items-center text-center">
                <span className="text-4xl font-bold">
                  {getNameInitials(item.username as string)}
                </span>
              </div>
            </div>
            <div className="ml-8 mt-2 mb-4 h-20 flex justify-start items-end">
              <span className="text-3xl font-bold">{item.username}</span>
            </div>
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
            <div className="flex justify-center items-center h-12 mx-4 mb-4 bg-blue-500 hover:bg-blue-300 rounded-lg">
              <button
                className="flex justify-center items-center text-white font-bold py-2 rounded-lg w-full"
                onClick={() => {
                  router.push(`/admin/student/${item.userId}`);
                }}
              >
                View Profile
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="rounded-md border bg-white shadow-lg">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="text-center justify-items-center"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center justify-items-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default UsersDashboard;
