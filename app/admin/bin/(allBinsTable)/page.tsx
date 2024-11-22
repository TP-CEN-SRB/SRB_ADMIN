import React from "react";
import { columns } from "./columns";
import { getAllBinsWithUserAndMaterial } from "@/app/action/bin";
import { DataTable } from "./data-table";

const AllBinsPage = async () => {
  const { bins, materials } = await getAllBinsWithUserAndMaterial();
  return (
    <div className="container mx-auto overflow-y-scroll h-[737px]">
      <DataTable columns={columns} data={bins} materials={materials} />
    </div>
  );
};

export default AllBinsPage;
