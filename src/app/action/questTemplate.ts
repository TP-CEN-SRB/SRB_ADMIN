"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { QuestSchema } from "@/schemas"
import { cached, invalidateByPrefix, CATALOG_TTL } from "@/lib/cache"

const CACHE_PREFIX = "cache:quest-templates:"

// Convert QuestSchema → only fields allowed for templates
const TemplateSchema = QuestSchema.pick({
  title: true,
  description: true,
  target: true,
  rewardPoints: true,
  materialType: true,
  duration: true,
})

// ---------- CREATE TEMPLATE ----------
export const createQuestTemplate = async (
  data: z.infer<typeof TemplateSchema>
) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (user?.role !== "admin") return { error: "Unauthorized" }

  try {
    const template = await prisma.questTemplate.create({
      data: {
        title: data.title,
        description: data.description,
        target: data.target,
        rewardPoints: data.rewardPoints,
        materialType: data.materialType,
        duration: data.duration,
      },
    })

    await invalidateByPrefix(CACHE_PREFIX)
    revalidatePath("/admin/activity/quest-template")
    return { success: "Quest template created!", template }
  } catch (err) {
    return { error: "Failed to create template" }
  }
}

// ---------- GET ALL TEMPLATES ----------
export type QuestTemplateSort =
  | "titleAsc"
  | "titleDesc"
  | "durationAsc"
  | "durationDesc"
  | "dateAsc"
  | "dateDesc"

function questTemplateOrderBy(sort: QuestTemplateSort) {
  switch (sort) {
    case "titleAsc":
      return { title: "asc" as const }
    case "titleDesc":
      return { title: "desc" as const }
    case "durationAsc":
      return { duration: "asc" as const }
    case "durationDesc":
      return { duration: "desc" as const }
    case "dateAsc":
      return { createdAt: "asc" as const }
    case "dateDesc":
    default:
      return { createdAt: "desc" as const }
  }
}

export const getQuestTemplates = async (
  page: number,
  limit: number,
  sort: QuestTemplateSort,
  search: string,
  materials: string[]
) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (user?.role !== "admin") return { templates: [], templateCount: 0, totalPages: 0 }

  const whereClause = {
    title: { contains: search, mode: "insensitive" as const },
    materialType: { in: materials },
  }

  return cached(
    `${CACHE_PREFIX}list:${page}:${limit}:${sort}:${search}:${materials.join(",")}`,
    CATALOG_TTL,
    async () => {
      const [templateCount, templates] = await Promise.all([
        prisma.questTemplate.count({ where: whereClause }),
        prisma.questTemplate.findMany({
          where: whereClause,
          orderBy: questTemplateOrderBy(sort),
          skip: (page - 1) * limit,
          take: limit,
        }),
      ])
      return { templates, templateCount, totalPages: Math.max(1, Math.ceil(templateCount / limit)) }
    }
  )
}

// ---------- GET TEMPLATE BY ID ----------
export const getQuestTemplateById = async (id: string) => {
  return cached(`${CACHE_PREFIX}${id}`, CATALOG_TTL, () =>
    prisma.questTemplate.findUnique({
      where: { id },
    })
  )
}

// ---------- UPDATE TEMPLATE ----------
export const updateQuestTemplate = async (
  id: string,
  data: z.infer<typeof TemplateSchema>
) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (user?.role !== "admin") return { error: "Unauthorized" }

  try {
    const updated = await prisma.questTemplate.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        target: data.target,
        rewardPoints: data.rewardPoints,
        materialType: data.materialType,
        duration: data.duration,
        updatedAt: new Date(),
      },
    })

    await invalidateByPrefix(CACHE_PREFIX)
    revalidatePath("/admin/activity/quest-template")
    return { success: "Template updated!", updated }
  } catch (err) {
    return { error: "Failed to update template" }
  }
}

// ---------- DELETE TEMPLATE ----------
export const deleteQuestTemplate = async (id: string) => {
    const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (user?.role !== "admin") return { error: "Unauthorized" }

  try {
    await prisma.questTemplate.delete({ where: { id } })
    await invalidateByPrefix(CACHE_PREFIX)
    revalidatePath("/admin/activity/quest-template")
    return { success: "Template deleted" }
  } catch (err) {
    return { error: "Failed to delete template" }
  }
}
