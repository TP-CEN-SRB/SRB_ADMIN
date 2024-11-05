import CreateBinForm from "@/components/Form/BinForms/CreateBinForm";
import prisma from "@/lib/db";
import React from "react";

const page = async () => {
  const users = await prisma.user.findMany();
  return <CreateBinForm users={users} />;
};

export default page;
