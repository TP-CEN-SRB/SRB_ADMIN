"use server"
import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const getDisposalByBinId = async (
  binId: string,
  page: number | null,
  sortOrder: string | undefined,
  sortItem: string | undefined
) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (user?.role !== "ADMIN") {
    return { error: "Permission denied!" }
  }
  const sortableItems = ["weight", "point", "createdAt"]
  const pageCondition = page != null && page < 0
  const sortOrderCondition =
    sortOrder !== undefined && sortOrder !== "asc" && sortOrder !== "desc"
  const sortItemCondition =
    sortItem !== undefined && !Object.values(sortableItems).includes(sortItem)
  if (pageCondition || sortItemCondition || sortOrderCondition) {
    return { disposalCount: 0, disposals: [] }
  }

  const [disposalCount, disposals, bin] = await Promise.all([
    prisma.disposal.count({ where: { binId: binId } }),
    prisma.disposal.findMany({
      where: { binId: binId },
      take: page ? 10 : undefined,
      skip: page ? (page - 1) * 10 : 0,
      orderBy:
        sortItem === sortableItems[0]
          ? { weightInGrams: sortOrder }
          : sortItem === sortableItems[1]
          ? { pointsAwarded: sortOrder }
          : sortItem === sortableItems[2]
          ? { createdAt: sortOrder }
          : { createdAt: "desc" },
      select: {
        id: true,
        weightInGrams: true,
        isRedeemed: true,
        pointsAwarded: true,
        userId: true,
        createdAt: true,
        imageUrl: true,
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
  return { disposalCount, disposals, bin }
}

export { getDisposalByBinId }
