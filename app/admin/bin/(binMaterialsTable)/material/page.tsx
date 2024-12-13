import React from "react";
import { getAllMaterials } from "@/app/action/binMaterial";
import { listOfBinMaterialInUse } from "@/app/action/bin";
import MaterialDataTable from "./materialDataTable";

const getData = async () => {
  const allBinMaterials = await getAllMaterials();
  return allBinMaterials.map((binMat) => ({
    id: binMat.id as string,
    name: binMat.name as string,
  }));
};

const AllBinMaterialsPage = async () => {
  const data = await getData();
  const binMaterialInUse = await listOfBinMaterialInUse();
  return (
    <div className="container mx-auto">
      <MaterialDataTable data={data} allBinMaterials={binMaterialInUse} />
    </div>
  );
};

export default AllBinMaterialsPage;
