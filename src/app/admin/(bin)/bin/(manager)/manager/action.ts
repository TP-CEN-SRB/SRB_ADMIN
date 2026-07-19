"use server"

import { prisma } from "@/lib/db"
import { Faculty } from "@/generated/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function getAllBinManagers() {
  const result = await prisma.user.findMany({
    where: {
      role: "BIN",
    },
    select: {
      id: true,
      name: true,
      email: true,
      faculty: true,
      lat: true,
      long: true,
      _count: {
        select: { bins: true },
      },
    },
  })
  return result
}

export async function listOfBinManagersUsed(
  page: number,
  limit: number,
  sort: string,
  search: string,
  faculties: string[]
) {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (user?.role !== "admin") {
    return { binManagers: [], binManagerCount: 0, totalPages: 1 }
  }

  const whereClause = {
    role: "BIN" as const,
    faculty: { in: faculties as Faculty[] },
    OR: search
      ? [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ]
      : undefined,
  }

  const orderBy = (function(){
    switch (sort) {
      case "nameAsc":
        return { name: "asc" as const }
      case "nameDesc":
        return { name: "desc" as const }
      case "binsAsc":
        return { bins: { _count: "asc" as const } }
      case "binsDesc":
        return { bins: { _count: "desc" as const } }
      default:
        return { name: "asc" as const }
    }
  })()

  const [binManagerCount, binManagers] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        faculty: true,
        _count: { select: { bins: true } },
      },
    }),
  ])

  return {
    binManagers: binManagers.map((binUser) => ({
      id: binUser?.id as string,
      name: binUser?.name as string,
      email: binUser?.email as string,
      faculty: binUser?.faculty as Faculty,
      _count: { bins: binUser._count.bins as number },
    })),
    binManagerCount,
    totalPages: Math.max(1, Math.ceil(binManagerCount / limit)),
  }
}
