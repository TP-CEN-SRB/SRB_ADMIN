import EditBinForm from "@/components/Form/AdminUserForms/EditBinForm";
import prisma from "@/lib/db";
import { Faculty } from "@prisma/client";
import React from "react";

const UpdateBinManagersPage = async ({
  params,
}: {
  params: { binUserID: string };
}) => {
  const binUser = await prisma.user.findUnique({
    where: {
      id: params.binUserID,
    },
    select: {
      name: true,
      email: true,
      location: true,
      faculty: true,
      lat: true,
      long: true,
    },
  });
  if (!binUser) {
    return <div>Bin Manager not found</div>;
  }
  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <EditBinForm
        id={params.binUserID}
        name={binUser.name ?? ""}
        email={binUser!.email}
        location={binUser.location ?? ""}
        faculty={binUser!.faculty ?? Faculty.ENG}
        latitude={binUser.lat?.toNumber() ?? 0}
        longitude={binUser.long?.toNumber() ?? 0}
      />
    </div>
  );
};

export default UpdateBinManagersPage;
