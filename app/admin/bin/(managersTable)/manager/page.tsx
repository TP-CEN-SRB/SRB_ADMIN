import React from "react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { getAllBinUsers } from "@/app/action/user";

const getData = async () => {
  const allBinUsers = await getAllBinUsers();
  return allBinUsers.map((binUsers) => ({
    id: binUsers.id as string,
    name: binUsers.name as string,
    email: binUsers.email as string,
  }));
};

const AllBinManagersPage = async () => {
  const binManagersTableData = await getData();
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={binManagersTableData} />
    </div>
  );
};

export default AllBinManagersPage;
