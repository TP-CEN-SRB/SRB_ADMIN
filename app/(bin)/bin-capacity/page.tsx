import { getBinsByUserId } from "@/app/action/bin";
import ButtonRedirect from "@/components/Button/ButtonRedirect";
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
      <ButtonRedirect rounded href="/" variant="outline" color="indigo">
        Back
      </ButtonRedirect>
    </div>
  );
};

export default BinCapacityPage;
