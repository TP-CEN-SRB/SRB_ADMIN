import { getAllBinUsers } from "@/app/action/user";
import UpdateBinManagerScreen from "@/components/Screen/UpdateBinManagerScreen";
import prisma from "@/lib/db";
import React from "react";

const UpdateBinManagersPage = async ({
  params,
}: {
  params: { binUserID: string };
}) => {
  const [binUser, binManagers] = await Promise.all([
    prisma.user.findUnique({
      where: {
        id: params.binUserID,
      },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        faculty: true,
        lat: true,
        long: true,
      },
    }),
    getAllBinUsers(),
  ]);
  if (!binUser) {
    return <div>Bin Manager not found</div>;
  }
  const filteredBinManagers = binManagers.filter(
    (manager) => manager.id !== binUser.id
  );
  return (
    <UpdateBinManagerScreen
      binManager={{
        ...binUser,
        lat: binUser.lat?.toNumber(),
        long: binUser.long?.toNumber(),
      }}
      data={filteredBinManagers.map((user) => ({
        ...user,
        lat: user.lat?.toNumber(),
        long: user.long?.toNumber(),
      }))}
    />
  );
};

export default UpdateBinManagersPage;
