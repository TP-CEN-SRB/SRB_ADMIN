import EditSubscriptionForm from "@/components/Form/AdminUserForms/EditSubscriptionForm";
import prisma from "@/lib/db";
import { getSessionUser } from "@/utils/getAuth";
import React from "react";

const NotificationPage = async () => {
  const user = await getSessionUser();
  const subscription = await prisma.subscription.findUnique({
    where: { userId: user?.id },
  });
  return (
    <div className="p-4">
      <EditSubscriptionForm
        isSubscribed={subscription?.isSubscribed}
        id={subscription?.id}
      />
    </div>
  );
};

export default NotificationPage;
