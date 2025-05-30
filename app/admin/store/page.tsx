import React from "react";
import { getStoreAccounts } from "@/app/action/store";
import StoreDataTable from "./storeDataTable";

const getData = async () => {
  const stores = await getStoreAccounts();
  return stores.map((store) => ({
    id: store.id,
    name: store.name,
    email: store.email,
    createdAt: new Date(store.createdAt).toLocaleDateString(),
  }));
};

const StoreAdminPage = async () => {
  const data = await getData();
  return <StoreDataTable data={data} />;
};

export default StoreAdminPage;
