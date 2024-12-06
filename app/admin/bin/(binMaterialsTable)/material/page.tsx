import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getAllMaterials } from "@/app/action/binMaterial";
import { getAllBinsWithMaterial } from "@/app/action/binMaterial";
import { getAllBinUsers } from "@/app/action/user";

const getData = async () => {
  const allBinUsers = await getAllBinUsers();
  return allBinUsers.map((binUsers) => ({
    id: binUsers.id as string,
    name: binUsers.name as string,
    email: binUsers.email as string,
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
