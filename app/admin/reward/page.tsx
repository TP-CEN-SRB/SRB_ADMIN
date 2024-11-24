import React from "react";
import RewardStatsGrid from "../components/rewardStatsGrid";
import prisma from "@/lib/db";
import RewardCard from "@/components/Card/RewardCard";
import Image from "next/image";
import RewardMore from "@/components/Dropdown/RewardMore";

const RewardPage = async () => {
  const rewards = await prisma.reward.findMany({
    take: 6,
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div className="max-w-screen-2xl mx-auto p-4">
      <RewardStatsGrid />
      <div className="grid lg:grid-cols-3 md:grid-cols-3 grid-cols-2 mt-10 gap-5">
        {rewards.map((reward, index) => (
          <RewardCard rounded key={index}>
            <div className="relative aspect-[3/2]">
              <Image
                src={reward.image}
                alt={reward.name}
                className="object-cover"
                fill
              />
              <div className="absolute top-3 right-3">
                <RewardMore id={reward.id} />
              </div>
            </div>
            <div className="p-3">
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
    </div>
  );
};

export default RewardPage;
