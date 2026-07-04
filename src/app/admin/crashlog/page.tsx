// app/admin/crashlog/page.tsx
import React from "react";
import CrashlogDataTable from "./crashlogTable"
import { prisma } from "@/lib/db";

const getData = async () => {
  const logs = await prisma.crashlog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return logs.map((log) => ({
    id: log.id,
    message: log.message,
    createdAt: log.createdAt.toISOString(),
  }));
};

const CrashlogPage = async () => {
  const data = await getData();
  return <CrashlogDataTable data={data} />;
};

export default CrashlogPage;
