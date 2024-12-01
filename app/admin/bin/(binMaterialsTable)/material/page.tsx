import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getAllMaterials } from "@/app/action/binMaterial";

const AllBinMaterialsPage = async () => {
  const allBinUsers = await getAllMaterials();
  return (
    <div className="container mx-auto">
      <DataTable columns={columns} data={allBinUsers} />
    </div>
  );
};

export default AllBinMaterialsPage;
