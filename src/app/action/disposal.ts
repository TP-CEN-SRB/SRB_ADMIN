"use server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { deleteDisposalImages } from "@/lib/disposalImages"

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

// Powers the "View Images" action on a DISPOSAL transaction row - a single
// transaction is created per redeemed DisposalQueue (see
// src/app/api/disposal/[id]/route.ts), so this looks up every disposal that
// was part of that queue.
const getDisposalsByQueueId = async (queueId: string) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (user?.role !== "admin") {
    return { error: "Permission denied!" }
  }

  const disposals = await prisma.disposal.findMany({
    where: { queueId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      weightInGrams: true,
      pointsAwarded: true,
      createdAt: true,
      imageUrl: true,
      carbonprint: true,
      bin: { select: { binMaterial: { select: { name: true } } } },
      user: { select: { name: true } },
    },
  })

  return { disposals }
}

const getBinImageSnapshot = async (
  binId: string
): Promise<{ error: string } | { count: number; asOf: string }> => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (user?.role !== "admin") {
    return { error: "Permission denied!" }
  }

  const count: number = await prisma.disposal.count({
    where: { binId, imageUrl: { not: null } },
  })
  return { count, asOf: new Date().toISOString() }
}

const deleteDisposalImagesForBin = async (binId: string, asOf: string) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (user?.role !== "admin") {
    return { error: "Permission denied!" }
  }

  const result = await deleteDisposalImages({
    binId,
    createdAt: { lte: new Date(asOf) },
  })
  revalidatePath(`/admin/bin/disposal/${binId}`)
  return result
}

export {
  getDisposalByBinId,
  getDisposalsByQueueId,
  getBinImageSnapshot,
  deleteDisposalImagesForBin,
}
