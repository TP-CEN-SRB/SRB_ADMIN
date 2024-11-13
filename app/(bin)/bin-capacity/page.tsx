import { getBinsByUserId } from "@/app/action/bin";
import ButtonRedirect from "@/components/Button/ButtonRedirect";
import BinCapacityChart from "@/components/Chart/BinCapacity";
import { getSessionUser } from "@/utils/getAuth";
import React from "react";

const BinCapacityPage = async () => {
  const user = await getSessionUser();
  const bins = await getBinsByUserId(user?.id as string);
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="grid grid-cols-3 place-content-center place-items-center">
        {bins &&
          bins.map((bin, index) => (
            <BinCapacityChart
              key={index}
              currentCapacity={bin.currentCapacity}
              totalCapacity={100}
              material={bin.binMaterial.name}
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
