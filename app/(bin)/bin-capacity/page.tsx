import { getBinsByUserId } from "@/app/action/bin";
import BinCapacityChart from "@/components/Chart/BinCapacity";
import { Button } from "@/components/ui/button";
import { getSessionUser } from "@/utils/getAuth";
import Link from "next/link";
import React from "react";

const BinCapacityPage = async () => {
  const user = await getSessionUser();
  const bins = await getBinsByUserId(user?.id as string);
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="flex max-h-[500px]">
        {bins &&
          bins.map((bin, index) => (
            <BinCapacityChart
              key={index}
              currentCapacity={bin.currentCapacity}
              totalCapacity={100}
              material={bin.material}
            />
          ))}
      </div>
      <Button
        asChild
        className="bg-blue-500 hover:bg-blue-600 text-white text-xl font-semibold py-8 px-8 rounded-full shadow-lg transition-all mt-8 min-w-56"
      >
        <Link href="/">Back</Link>
      </Button>
    </div>
  );
};

export default BinCapacityPage;
