import CreateSubscriptionForm from "@/components/Form/SubscriptionForms/CreateSubscriptionForm";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import React from "react";

const CreateRewardPage = async ({ params }: { params: { id: string } }) => {
  const userId = params.id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    notFound();
  }
  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <CreateSubscriptionForm id={userId}/>
    </div>
  );
};

export default CreateRewardPage;
