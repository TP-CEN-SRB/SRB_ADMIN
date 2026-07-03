import { getBinsByUserId } from "@/app/action/bin";
import BinCapacityChart from "@/components/Chart/BinCapacityChart";
import { notFound } from "next/navigation";
import React from "react";

const BinCapacityPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params; 
  const bins = await getBinsByUserId(id);
  if (bins.length === 0) {
    notFound();
  }
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="text-slate-800 mb-8">Bin Capacity</h1>
      <div className="grid place-items-center gap-4 md:grid-cols-5 sm:grid-cols-3 grid-cols-2">
        {bins.map((bin: { currentCapacity: number; binMaterial: { name: string; }; status: string; }, index: React.Key | null | undefined) => (
          <BinCapacityChart
            key={index}
            currentCapacity={bin.currentCapacity}
            material={bin.binMaterial.name}
            isUnderMaintenance={bin.status == "UNDER_MAINTENANCE"}
          />
        ))}
      </div>
    </div>
  );
};

export default BinCapacityPage;
