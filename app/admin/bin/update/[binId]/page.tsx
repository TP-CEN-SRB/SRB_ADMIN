import { getBinById } from "@/app/action/bin";
import UpdateBinForm from "@/components/Form/BinForms/UpdateBinForm";
import React from "react";

async function Page({ params }: { params: { binId: string } }) {
  // Fetch the bin data first
  const bin = await getBinById(params.binId);

  if (!bin) {
    return <div>Bin not found</div>;
  }

  return <UpdateBinForm id={params.binId} initialData={bin} />;
}

export default Page;
