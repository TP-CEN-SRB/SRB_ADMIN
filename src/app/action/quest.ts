"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { QuestSchema, UpdateQuestSchema } from "@/schemas"
import { z } from "zod"
import { cached, invalidateByPrefix, CATALOG_TTL } from "@/lib/cache"

const CACHE_PREFIX = "cache:quests:"

type Quest = {
  id: string
  title: string
  description: string
  target: number
  materialType: string
  rewardPoints: number
  startDate: Date | null
  endDate: Date | null
  createdAt: Date
}

type GetQuestsResult = {
  quests: Quest[]
  questCount: number
}

export const createQuest = async (data: z.infer<typeof QuestSchema>) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user

  if (user?.role !== "admin") {
    return { error: "Unauthorized" }
  }

  try {
    const now = new Date()
    const endDate = new Date(now.getTime() + data.duration * 24 * 60 * 60 * 1000)

    const quest = await prisma.questDetails.create({
      data: {
        title: data.title,
        description: data.description,
        target: data.target,
        materialType: data.materialType,
        rewardPoints: data.rewardPoints,
        startDate: now,
        endDate: endDate,
      },
    })

    const users = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        emailVerified: true,
      },
      select: { id: true },
    })

    const userQuests = users.map((u) => ({
      userId: u.id,
      questId: quest.id,
      progress: 0,
      isCompleted: false,
      completedAt: null,
    }))

    await prisma.userQuest.createMany({
      data: userQuests,
      skipDuplicates: true,
    })

    await invalidateByPrefix(CACHE_PREFIX)
    revalidatePath("/admin/activity/quest")
    return { success: "Quest created and assigned to users", quest }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to create quest" }
  }
}

export const deleteQuest = async (questId: string) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user

  if (user?.role !== "admin") {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.questDetails.delete({
      where: { id: questId },
    })

    await invalidateByPrefix(CACHE_PREFIX)
    revalidatePath("/admin/activity/quest")
    return { success: "Quest deleted successfully" }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to delete quest" }
  }
}

export const getUsersByQuestId = async (questId: string) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user

  if (user?.role !== "admin") {
    return []
  }

  const usersInQuest = await prisma.userQuest.findMany({
    where: { questId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          faculty: true,
        },
      },
    },
  })

  return usersInQuest
}

export const updateQuest = async (
  id: string,
  data: z.infer<typeof UpdateQuestSchema>
) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user

  if (user?.role !== "admin") {
    return { error: "Unauthorized" }
  }

  try {
    const updated = await prisma.questDetails.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        target: data.target,
        materialType: data.materialType,
        rewardPoints: data.rewardPoints,
        updatedAt: new Date(),
      },
    })

    await invalidateByPrefix(CACHE_PREFIX)
    revalidatePath("/admin/activity/quest")
    return { success: "Quest updated successfully", quest: updated }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to update quest" }
  }
}

export const getQuestById = async (id: string) => {
  return cached(`${CACHE_PREFIX}${id}`, CATALOG_TTL, () =>
    prisma.questDetails.findUnique({
      where: {
        id: id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        target: true,
        materialType: true,
        rewardPoints: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
    })
  )
}

export const getQuests = async (
  page: number,
  limit: number,
  sortOrder: string | undefined,
  sortItem: string | undefined,
  search: string,
  materials: string[]
): Promise<GetQuestsResult> => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user

  if (user?.role !== "admin") {
    return { questCount: 0, quests: [] }
  }

  const sortableItems = ["title", "materialType", "target", "rewardPoints", "createdAt"]
  const isInvalidSortOrder = sortOrder && !["asc", "desc"].includes(sortOrder)
  const isInvalidSortItem = sortItem && !sortableItems.includes(sortItem)

  if (isInvalidSortOrder || isInvalidSortItem) {
    return { questCount: 0, quests: [] }
  }

  const whereClause = {
    title: { contains: search, mode: "insensitive" as const },
    materialType: { in: materials },
  }

  return cached(
    `${CACHE_PREFIX}list:${page}:${limit}:${sortOrder}:${sortItem}:${search}:${materials.join(",")}`,
    CATALOG_TTL,
    async function(){
      const [questCount, quests] = await Promise.all([
        prisma.questDetails.count({ where: whereClause }),
        prisma.questDetails.findMany({
          where: whereClause,
          take: limit,
          skip: (page - 1) * limit,
          orderBy: sortItem
            ? {
                [sortItem]: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc",
              }
            : { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            description: true,
            materialType: true,
            target: true,
            rewardPoints: true,
            startDate: true,
            endDate: true,
            createdAt: true,
          },
        }),
      ])

      return { questCount, quests }
    }
  )
}
