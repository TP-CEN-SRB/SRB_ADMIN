import { getAllBinUsers } from "@/app/action/user";
import CreateBinManagerScreen from "@/components/Screen/CreateBinManagerScreen";
import React from "react";

const CreateBinManagerPage = async () => {
  const binManagers = await getAllBinUsers();
  return (
    <CreateBinManagerScreen
      data={binManagers.map((user) => ({
        ...user,
        lat: user.lat?.toNumber(),
        long: user.long?.toNumber(),
      }))}
    />
  );
};

export default CreateBinManagerPage;
