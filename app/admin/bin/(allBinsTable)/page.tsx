import React from "react";
import { DataTable } from "./data-table";
import { Bin, columns } from "./columns";
import { BinMaterial, BinStatus } from "@prisma/client";
import { getAllBinsWithUser } from "@/app/action/bin";

const getData = async () => {
  const allBins = await getAllBinsWithUser();
  return allBins.map((bin) => ({
    location: bin.location,
    status: bin.status,
    material: bin.material,
    userId: bin.User.name as string,
  }));
};

const AllBins = async () => {
  const data = await getData();
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default AllBins;
