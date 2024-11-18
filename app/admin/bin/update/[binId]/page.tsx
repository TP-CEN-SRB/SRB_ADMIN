import { getBinById } from "@/app/action/bin";
import UpdateBinForm from "@/components/Form/BinForms/UpdateBinForm";
import prisma from "@/lib/db";
import React from "react";

async function Page({ params }: { params: { binId: string } }) {
  // Fetch the bin data first
  const bin = await getBinById(params.binId);
  if (!bin) {
    return <div>Bin not found</div>;
  }
  const getAllMaterials = await prisma.binMaterial.findMany();

  return (
    <>
      <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs py-4">
        <UpdateBinForm
          id={params.binId}
          initialData={bin}
          materials={getAllMaterials}
          location={bin.user.location as string}
          binMaterialName={bin.binMaterial.name as string}
        />
      </div>
    </>
  );
}

export default Page;
