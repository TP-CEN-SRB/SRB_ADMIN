import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getAllBinUsers } from "@/app/action/user";

const AllBinManagersPage = async () => {
  const allBinUsers = await getAllBinUsers();
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={allBinUsers} />
    </div>
  );
};

export default AllBinManagersPage;
