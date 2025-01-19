import React from "react";
import { columns } from "./columns";
import { getAllBinsWithUserAndMaterial } from "@/app/action/bin";
import { DataTable } from "./data-table";

const AllBinsPage = async () => {
  const { bins, materials } = await getAllBinsWithUserAndMaterial();
  return <DataTable columns={columns} data={bins} materials={materials} />;
};

export default AllBinsPage;
