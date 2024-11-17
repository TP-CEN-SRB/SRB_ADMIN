import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getAllBinsWithUser } from "@/app/action/bin";

const getData = async () => {
  const allBins = await getAllBinsWithUser();
  return allBins.map((bin) => ({
    location: bin.User.location as string,
    status: bin.status,
    material: bin.binMaterial.name,
    binId: bin.id as string,
    userName: bin.User.name as string,
  }));
};

const AllBins = async () => {
  const data = await getData();
  return (
    <div className="container mx-auto py-10 overflow-y-scroll h-[737px]">
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default AllBins;
