"use server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export type Disposal = {
  id: string
  weightInGrams: number
  isRedeemed: boolean
  pointsAwarded: number
  userId: string | null
  createdAt: Date
  imageUrl: string | null
  user: { name: string } | null
}

const getDisposalByBinId = async (
  binId: string,
  page: number,
  limit: number,
  sort: string | undefined
) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (user?.role !== "admin") {
    return { error: "Permission denied!" }
  }

  const orderBy = (function () {
    switch (sort) {
      case "weightAsc":
        return { weightInGrams: "asc" as const }
      case "weightDesc":
        return { weightInGrams: "desc" as const }
      case "pointsAsc":
        return { pointsAwarded: "asc" as const }
      case "pointsDesc":
        return { pointsAwarded: "desc" as const }
      case "dateAsc":
        return { createdAt: "asc" as const }
      case "dateDesc":
      default:
        return { createdAt: "desc" as const }
    }
  })()

  const [disposalCount, disposals, bin] = await Promise.all([
    prisma.disposal.count({ where: { binId: binId } }),
    prisma.disposal.findMany({
      where: { binId: binId },
      take: limit,
      skip: (page - 1) * limit,
      orderBy,
      select: {
        id: true,
        weightInGrams: true,
        isRedeemed: true,
        pointsAwarded: true,
        userId: true,
        createdAt: true,
        imageUrl: true,
        user: { select: { name: true } },
      },
    }),
    prisma.bin.findUnique({
      where: { id: binId },
      select: {
        binMaterial: { select: { name: true } },
        user: { select: { location: true } },
      },
    }),
  ])
  return {
    disposalCount,
    disposals,
    bin,
    totalPages: Math.max(1, Math.ceil(disposalCount / limit)),
  }
}

export { getDisposalByBinId }
