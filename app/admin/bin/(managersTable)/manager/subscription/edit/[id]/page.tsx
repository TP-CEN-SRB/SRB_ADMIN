import EditSubscriptionForm from "@/components/Form/SubscriptionForms/EditSubscriptionForm";
import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import React from "react";

const EditSubscriptionPage = async ({ params }: { params: { id: string } }) => {
  const subscription = await prisma.subscription.findUnique({
    where: { id: params.id },
  });
  if (!subscription) {
    notFound();
  }
  return (
    <div className="min-h-screen flex items-center justify-center container mx-auto max-w-screen-xs p-4">
      <EditSubscriptionForm id={subscription.id} email={subscription.email} />
    </div>
  );
};

export default EditSubscriptionPage;
