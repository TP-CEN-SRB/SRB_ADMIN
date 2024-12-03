"use server";
import prisma from "@/lib/db";
import { SubscriptionSchema } from "@/schemas";
import { getSessionUser } from "@/utils/getAuth";
import { z } from "zod";

const updateSubscription = async (
  values: z.infer<typeof SubscriptionSchema>,
  subscriptionId: string | undefined
) => {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return { error: "Unauthorized access!" };
  }
  const validatedFields = SubscriptionSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid field!" };
  }
  const { isSubscribed } = validatedFields.data;

  const subscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { isSubscribed },
  });
  return { success: "Subscription successfully updated!" };
};

export { updateSubscription };
