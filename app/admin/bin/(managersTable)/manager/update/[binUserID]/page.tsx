import EditBinForm from "@/components/Form/AdminUserForms/EditBinForm";
import prisma from "@/lib/db";
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
        faculty={binUser!.faculty ?? "ENGINEERING"}
      />
    </div>
  );
};

export default UpdateBinManagersPage;
