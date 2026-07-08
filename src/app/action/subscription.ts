"use server"
import { prisma } from "@/lib/db"
import { SubscriptionSchema } from "@/schemas"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const getSubscriptionByUserId = async (userId: string) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (!user || user?.role !== "ADMIN") {
    return { error: "Unauthorized access!" }
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
  })

  return { subscriptions }
}

const createSubscription = async (
  values: z.infer<typeof SubscriptionSchema>,
  userId: string
) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (!user || user?.role !== "ADMIN") {
    return { error: "Unauthorized access!" }
  }
  const validatedFields = SubscriptionSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid field!" }
  }
  const { email } = validatedFields.data
  const existingSubscription = await prisma.subscription.findUnique({
    where: { email: email },
  })
  if (existingSubscription) {
    return { error: "Email already exists" }
  }
  const existingBinManager = await prisma.user.findUnique({
    where: { id: userId },
  })
  if (!existingBinManager) {
    return { error: "Bin manager not found" }
  }
  const subscription = await prisma.subscription.create({
    data: { email: email, userId: userId },
  })
  revalidatePath("/admin/bin/manager/subscription")
  return {
    success: "Subscription added successfully",
    userId: subscription.userId,
  }
}

const updateSubscription = async (
  values: z.infer<typeof SubscriptionSchema>,
  subscriptionId: string
) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (!user || user?.role !== "ADMIN") {
    return { error: "Unauthorized access!" }
  }
  const validatedFields = SubscriptionSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid field!" }
  }
  const { email } = validatedFields.data
  const existingSubscription = await prisma.subscription.findFirst({
    where: { email: email, id: { not: subscriptionId } },
  })
  if (existingSubscription) {
    return { error: "Email already exists!" }
  }
  const subscription = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: { email: email },
  })
  revalidatePath("/admin/bin/manager/subscription")
  return {
    success: "Subscription updated successfully",
    userId: subscription.userId,
  }
}

const deleteSubscription = async (subscriptionId: string) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (!user || user?.role !== "ADMIN") {
    return { error: "Unauthorized access!" }
  }
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
  })
  if (!subscription) {
    return { error: "Subscription not found" }
  }
  const deletedSubscription = await prisma.subscription.delete({
    where: { id: subscriptionId },
  })
  if (!deletedSubscription) {
    return { error: "Failed to delete user" }
  }
  revalidatePath("/admin/bin/manager/subscription")
  return {
    success: `Subscription ${deletedSubscription.id} deleted successfully`,
  }
}

export {
  createSubscription,
  updateSubscription,
  getSubscriptionByUserId,
  deleteSubscription,
}
