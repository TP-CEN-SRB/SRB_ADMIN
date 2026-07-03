import RewardCard from "@/components/Card/RewardCard";
import RewardMore from "@/components/Dropdown/RewardMore";
import { prisma } from "@/lib/db";
import Image from "next/image";
import React from "react";
import { FaCircleDot } from "react-icons/fa6";

const RewardPage = async () => {
  const rewards = await prisma.reward.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-3 grid-cols-2 gap-5 p-4">
      {rewards.map((reward: { image: string | Blob | undefined; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; id: string; isAvailable: any; pointsRequired: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; description: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }, index: React.Key | null | undefined) => (
        <RewardCard rounded key={index}>
          <div className="relative aspect-3/2">
            <img
              src={reward.image}
              className="object-cover w-full h-full"
            />
            <div className="absolute top-3 right-3">
              <RewardMore id={reward.id} />
            </div>
          </div>
          <div className="p-3 text-slate-700">
            <div className="flex items-center gap-2">
              {reward.isAvailable ? (
                <FaCircleDot className="text-green-500" />
              ) : (
                <FaCircleDot className="text-red-600" />
              )}
              <h2 className="md:text-xl text-lg">{reward.name}</h2>
            </div>
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
  );
};

export default RewardPage;
