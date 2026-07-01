import EditRewardForm from "@/components/Form/RewardForms/EditRewardForm";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import React from "react";

const EditRewardPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params; 
  const reward = await prisma.reward.findUnique({ where: { id } });
  if (!reward) {
    notFound();
  }
  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-md p-4">
      <EditRewardForm reward={reward} />
    </div>
  );
};

export default EditRewardPage;
