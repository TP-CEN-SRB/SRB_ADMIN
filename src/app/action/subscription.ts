"use server"
import { prisma } from "@/lib/db"
import { SubscriptionSchema } from "@/schemas"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Role } from "@/generated/prisma"

const getAllSubscriptions = async (
  page: number,
  limit: number,
  search: string,
  sortOrder: "asc" | "desc" = "desc"
) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (!user || user?.role !== "admin") {
    return { subscriptions: [], subscriptionCount: 0, totalPages: 1 }
  }

  const whereClause = search
    ? { email: { contains: search, mode: "insensitive" as const } }
    : {}

  const [subscriptionCount, subscriptions] = await Promise.all([
    prisma.subscription.count({ where: whereClause }),
    prisma.subscription.findMany({
      where: whereClause,
      orderBy: { createdAt: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        createdAt: true,
        userId: true,
        user: {
          select: { name: true, location: true, faculty: true },
        },
      },
    }),
  ])

  return {
    subscriptions,
    subscriptionCount,
    totalPages: Math.max(1, Math.ceil(subscriptionCount / limit)),
  }
}

const getAllBinManagersForPicker = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (!user || user?.role !== "admin") {
    return []
  }

  return prisma.user.findMany({
    where: { role: Role.BIN },
    orderBy: { name: "asc" },
    select: { id: true, name: true, location: true },
  })
}

const getSubscriptionByUserId = async (userId: string) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (!user || user?.role !== "admin") {
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
  if (!user || user?.role !== "admin") {
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
  if (!user || user?.role !== "admin") {
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
  if (!user || user?.role !== "admin") {
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
  getAllSubscriptions,
  getAllBinManagersForPicker,
}
