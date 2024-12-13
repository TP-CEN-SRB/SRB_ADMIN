import React from "react";
import { getAllBinUsers, listOfBinManagersUsed } from "@/app/action/user";
import BinManagerDataTable from "./binManagerDataTable";
import { Faculty } from "@prisma/client";

const getData = async () => {
  const allBinUsers = await getAllBinUsers();
  return allBinUsers.map((binUser) => ({
    id: binUser.id as string,
    name: binUser.name as string,
    email: binUser.email as string,
    faculty: binUser.faculty as Faculty,
  }));
};

const binManagersArr = async () => {
  const binManagers = await listOfBinManagersUsed();
  return binManagers.map((binUser) => ({
    id: binUser?.id as string,
    name: binUser?.name as string,
    email: binUser?.email as string,
    faculty: binUser?.faculty as Faculty,
  }));
};

const AllBinManagersPage = async () => {
  const data = await getData();
  const allBinUsers = await binManagersArr();
  return (
    <div className="container mx-auto py-10">
      <BinManagerDataTable data={data} allBinManagers={allBinUsers} />
    </div>
  );
};

export default AllBinManagersPage;
