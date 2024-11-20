import { getUsedMaterialsForBin } from "@/app/action/bin";
import CreateBinForm from "@/components/Form/BinForms/CreateBinForm";
import prisma from "@/lib/db";
import React from "react";

const CreateBinFormPageWithBinUser = async ({
  params,
}: {
  params: { binUserId: string };
}) => {
  const [getAllMaterials, getBinLocation, getUnavailableMaterialsForBin] =
    await Promise.all([
      prisma.binMaterial.findMany(),
      prisma.user.findUnique({
        where: { id: params.binUserId },
        select: { location: true },
      }),
      prisma.bin.findMany({
        select: {
          binMaterial: true,
        },
        where: {
          userId: params.binUserId,
        },
      }),
    ]);
  return (
    <>
      <div className="flex justify-center min-h-screen items-center">
        <div className="container mx-auto max-w-lg py-8">
          <CreateBinForm
            materials={getAllMaterials}
            binUserId={params.binUserId}
            binLocation={getBinLocation?.location}
            usedBinMaterials={getUnavailableMaterialsForBin.map(
              (bin) => bin.binMaterial
            )}
          />
        </div>
      </div>
    </>
  );
};

export default CreateBinFormPageWithBinUser;
