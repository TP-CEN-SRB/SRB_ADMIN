import React from "react";
import RewardStatsGrid from "../components/rewardStatsGrid";
import prisma from "@/lib/db";
import RewardCard from "@/components/Card/RewardCard";
import Image from "next/image";
import RewardMore from "@/components/Dropdown/RewardMore";
import { FaCircleDot } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const RewardPage = async () => {
  const rewards = await prisma.reward.findMany({
    take: 6,
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div className="mx-auto p-4">
      <RewardStatsGrid />
      {rewards.length > 0 && (
        <div className="flex justify-end mt-5">
          <Button
            asChild
            variant="secondary"
            className="bg-white shadow-md text-slate-800 font-semibold w-[200px] flex items-center justify-center"
          >
            <Link href="/admin/reward/all">View all</Link>
          </Button>
        </div>
      )}
      {rewards.length ? (
        <>
          <h1 className="mt-3 text-slate-800">Recent Rewards</h1>
          <div className="grid md:grid-cols-3 grid-cols-2 mt-10 gap-5">
            {rewards.map((reward, index) => (
              <RewardCard rounded key={index}>
                <div className="relative aspect-[3/2]">
                  {/* <Image
                    src={reward.image}
                    alt={reward.name}
                    className="object-cover"
                    fill
                  /> */}
                  <img
                    src={reward.image}
                    alt={reward.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-3 right-3">
                    <RewardMore id={reward.id} />
                  </div>
                </div>
                <div className="p-3 text-slate-700">
                  {reward.isAvailable ? (
                    <FaCircleDot className="text-green-500" />
                  ) : (
                    <FaCircleDot className="text-red-600" />
                  )}
                  <h2 className="md:text-xl text-lg">{reward.name}</h2>

                  <h2 className="md:text-lg text-base">
                    {reward.pointsRequired} pts
                  </h2>
                  <p className="line-clamp-2 mt-2 text-sm md:text-base whitespace-pre-line">
                    {reward.description}
                  </p>
                </div>
              </RewardCard>
            ))}
          </div>
        </>
      ) : (
        <h1 className="mt-3 text-slate-800">No rewards found</h1>
      )}
    </div>
  );
};

export default RewardPage;
