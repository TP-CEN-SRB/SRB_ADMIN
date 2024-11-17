import CreateBinForm from "@/components/Form/BinForms/CreateBinForm";
import prisma from "@/lib/db";
import React from "react";

const CreateBinFormPageWithBinUser = async ({
  params,
}: {
  params: { binUserId: string };
}) => {
  const [getAllMaterials, getBinLocation] = await Promise.all([
    prisma.binMaterial.findMany(),
    prisma.user.findUnique({
      where: { id: params.binUserId },
      select: { location: true },
    }),
  ]);
  // const getAllMaterials = await prisma.binMaterial.findMany();
  // const getBinLocation = await prisma.user.findUnique({
  //   where: { id: params.binUserId },
  //   select: { location: true },
  // });
  return (
    <>
      <div className="flex justify-center min-h-screen items-center">
        <div className="container mx-auto max-w-lg py-8">
          <CreateBinForm
            materials={getAllMaterials}
            binUserId={params.binUserId}
            binLocation={getBinLocation?.location}
          />
        </div>
      </div>
    </>
  );
};

export default CreateBinFormPageWithBinUser;
