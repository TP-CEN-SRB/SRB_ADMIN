import CreateBinForm from "@/components/Form/BinForms/CreateBinForm";
import prisma from "@/lib/db";
import React from "react";

const CreateBinFormPageWithBinUser = async ({
  params,
}: {
  params: { binUserId: string };
}) => {
  const getAllMaterials = await prisma.binMaterial.findMany();
  return (
    <>
      <div className="flex justify-center min-h-screen items-center">
        <div className="container mx-auto max-w-xl py-8">
          <CreateBinForm
            materials={getAllMaterials}
            binUserId={params.binUserId}
          />
        </div>
      </div>
    </>
  );
};

export default CreateBinFormPageWithBinUser;
