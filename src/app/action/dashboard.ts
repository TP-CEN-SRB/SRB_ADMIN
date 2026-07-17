"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { cached, DASHBOARD_TTL } from "@/lib/cache"
import { DateRange } from "@/utils/dateUtils"
import { BinStatus, Role } from "@/generated/prisma"

export type DashboardPeriod = "day" | "week" | "month" | "year"

const ONLINE_THRESHOLD_MS = 10 * 60 * 1000

export const getDashboardStats = async (period: DashboardPeriod) => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user?.role !== "admin") {
    return {
      totalBins: 0,
      functionalBins: 0,
      underMaintenanceBins: 0,
      binsOnline: 0,
      disposalsMade: 0,
      totalCarbonOffsetKg: 0,
      activeUsers: 0,
    }
  }

  const { startDate, endDate } = DateRange(period)

  return cached(
    `cache:dashboard:stats:${period}`,
    DASHBOARD_TTL,
    async () => {
      const [
        totalBins,
        functionalBins,
        underMaintenanceBins,
        binsOnline,
        disposalsMade,
        carbonAgg,
        activeUserIds,
      ] = await Promise.all([
        prisma.bin.count(),
        prisma.bin.count({ where: { status: BinStatus.FUNCTIONAL } }),
        prisma.bin.count({ where: { status: BinStatus.UNDER_MAINTENANCE } }),
        prisma.bin.count({
          where: { lastHeartBeat: { gte: new Date(Date.now() - ONLINE_THRESHOLD_MS) } },
        }),
        prisma.disposal.count({
          where: { createdAt: { gte: startDate, lte: endDate } },
        }),
        prisma.disposal.aggregate({
          where: { createdAt: { gte: startDate, lte: endDate } },
          _sum: { carbonprint: true },
        }),
        prisma.disposal.findMany({
          where: {
            createdAt: { gte: startDate, lte: endDate },
            userId: { not: null },
          },
          select: { userId: true },
          distinct: ["userId"],
        }),
      ])

      return {
        totalBins,
        functionalBins,
        underMaintenanceBins,
        binsOnline,
        disposalsMade,
        totalCarbonOffsetKg: carbonAgg._sum.carbonprint ?? 0,
        activeUsers: activeUserIds.length,
      }
    }
  )
}
