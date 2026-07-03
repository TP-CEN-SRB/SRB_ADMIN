import React from "react";
import { getStoreAccounts } from "@/app/action/store";
import StoreDataTable from "./storeDataTable";

const getData = async () => {
  const stores = await getStoreAccounts();
  return stores.map((store: { id: any; name: any; email: any; faculty: any; point: { balance: any; updatedAt: { toISOString: () => any; }; }; _count: { transactions: any; }; createdAt: string | number | Date; }) => ({
    id: store.id,
    name: store.name,
    email: store.email,
    faculty: store.faculty ?? "N/A",
    totalPoints: store.point?.balance ?? 0,
    lastActive: store.point?.updatedAt?.toISOString() ?? "N/A",
    totalPurchases: store._count?.transactions ?? 0,
    createdAt: new Date(store.createdAt).toLocaleDateString(),
  }));
};

const StoreAdminPage = async () => {
  const data = await getData();
  return <StoreDataTable data={data} />;
};

export default StoreAdminPage;
