"use server"

import { prisma } from "@/lib/db"
import { BinStatus } from "@/generated/prisma"
import { revalidatePath } from "next/cache"
import { invalidateDashboardCache } from "@/app/action/dashboard"

export const deleteBin = async (id: string) => {
  const bin = await prisma.bin.findUnique({
    where: {
      id,
    },
  })
  if (bin) {
    await prisma.bin.delete({
      where: {
        id,
      },
    })
    await invalidateDashboardCache()
    revalidatePath("/admin/bin")
    return { success: `Bin with ID ${id} deleted successfully` }
  } else return { error: `Bin with ID ${id} does not exist` }
}

export const getAllBinsWithUserAndMaterial = async (
  page: number,
  limit: number,
  sort: string,
  search: string,
  statuses: string[],
  materials: string[]
) => {
  const whereClause = {
    status: { in: statuses as BinStatus[] },
    binMaterial: { name: { in: materials } },
    user: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { location: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : undefined,
  }

  const orderBy = (function(){
    switch (sort) {
      case "nameAsc":
        return { user: { name: "asc" as const } }
      case "nameDesc":
        return { user: { name: "desc" as const } }
      case "capacityAsc":
        return { currentCapacity: "asc" as const }
      case "capacityDesc":
        return { currentCapacity: "desc" as const }
      case "dateAsc":
        return { createdAt: "asc" as const }
      case "dateDesc":
      default:
        return { createdAt: "desc" as const }
    }
  })()

  const [binCount, bins] = await Promise.all([
    prisma.bin.count({ where: whereClause }),
    prisma.bin.findMany({
      where: whereClause,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        status: true,
        currentCapacity: true,
        clearCount: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { disposals: true } },
        userId: true,
        user: {
          select: {
            name: true,
            location: true,
          },
        },
        binMaterial: {
          select: {
            name: true,
          },
        },
      },
    }),
  ])

  return {
    bins,
    binCount,
    totalPages: Math.max(1, Math.ceil(binCount / limit)),
  }
}
