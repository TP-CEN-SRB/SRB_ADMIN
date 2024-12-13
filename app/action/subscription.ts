"use server";
import prisma from "@/lib/db";
import { SubscriptionSchema } from "@/schemas";
import { getSessionUser } from "@/utils/getAuth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const getSubscriptionByUserId = async (userId: string) => {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return { error: "Unauthorized access!" };
  }
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: userId,
    },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      email: true,
    },
  });

  return { subscriptions };
};
const updateSubscription = async (
  values: z.infer<typeof SubscriptionSchema>,
  subscriptionId: string
) => {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return { error: "Unauthorized access!" };
  }
  const validatedFields = SubscriptionSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid field!" };
  }
  const { email } = validatedFields.data;
  const existingSubscription = await prisma.subscription.findFirst({
    where: { email: email, id: { not: subscriptionId } },
  });
  if (existingSubscription) {
    return { error: "Reward with the same name already exists!" };
  }
  const subscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { email: email },
  });
  revalidatePath("/admin/bin/manager/subscription");
  return {
    success: "Subscription successfully updated!",
    userId: subscription.userId,
  };
};

export { updateSubscription, getSubscriptionByUserId };
