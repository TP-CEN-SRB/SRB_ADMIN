import CreateSubscriptionForm from "@/components/FormLogic/SubscriptionForms/CreateSubscriptionForm";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import React from "react";

const CreateRewardPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params; 
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    notFound();
  }
  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <CreateSubscriptionForm id={id}/>
    </div>
  );
};

export default CreateRewardPage;
