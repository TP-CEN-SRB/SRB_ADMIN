import React from "react";
import { Nunito } from "next/font/google";
import RewardsGrid from "../components/rewardsGrid";
import { Button } from "@/components/ui/button";
import RewardStatsGrid from "../components/rewardStatsGrid";

const nunito600 = Nunito({
  weight: "600",
  subsets: ["latin"],
});

const nunito400 = Nunito({
  weight: "300",
  subsets: ["latin"],
});

const page = () => {
  return (
    <>
      <RewardStatsGrid />
      <div className="flex justify-end mb-4">
        <Button variant="secondary" className="mr-4 w-[200px]">
          View all
        </Button>
      </div>
      <RewardsGrid />
    </>
  );
};

export default page;
