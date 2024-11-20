import { getBinMaterialById } from "@/app/action/binMaterial";
import UpdateBinMaterialForm from "@/components/Form/BinForms/UpdateBinMaterialForm";
import React from "react";

const UpdateBinMaterialPage = async ({
  params,
}: {
  params: { binMaterialId: string };
}) => {
  const binMaterial = await getBinMaterialById(params.binMaterialId);
  return (
    <>
      <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs py-4">
        <UpdateBinMaterialForm
          id={params.binMaterialId}
          initialData={binMaterial?.name}
        />
      </div>
    </>
  );
};

export default UpdateBinMaterialPage;
