import React from "react";
import { listOfBinManagersUsed } from "@/app/action/user";
import BinManagerDataTable from "./binManagerDataTable";

const AllBinManagersPage = async () => {
  const binManagers = await listOfBinManagersUsed();
  return <BinManagerDataTable data={binManagers} />;
};

export default AllBinManagersPage;
