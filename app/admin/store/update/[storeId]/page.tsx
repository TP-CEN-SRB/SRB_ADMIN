import { getStoreById } from "@/app/action/store";
import UpdateStoreForm from "@/components/Form/StoreForms/UpdateStoreForm";
import { notFound } from "next/navigation";
import React from "react";

const UpdateStorePage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  // Fetch store details
  const store = await getStoreById(params.storeId);

  if (!store) {
    notFound(); 
  }

  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs py-4">
      <UpdateStoreForm id={params.storeId} store={store} />
    </div>
  );
};

export default UpdateStorePage;
