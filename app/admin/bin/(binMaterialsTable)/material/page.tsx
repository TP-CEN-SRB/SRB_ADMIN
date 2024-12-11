import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getAllMaterials } from "@/app/action/binMaterial";

const getData = async () => {
  const allBinMaterials = await getAllMaterials();
  return allBinMaterials.map((binMat) => ({
    id: binMat.id as string,
    name: binMat.name as string,
  }));
};

const AllBinMaterialsPage = async () => {
  const data = await getData();
  return (
    <div className="container mx-auto">
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default AllBinMaterialsPage;
