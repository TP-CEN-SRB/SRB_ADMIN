"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { cached, DASHBOARD_TTL } from "@/lib/cache"
import { DateRange, getWeeksInMonth, months, days } from "@/utils/dateUtils"
import { BinStatus, Role } from "@/generated/prisma"

export type DashboardPeriod = "day" | "week" | "month" | "year"

const ONLINE_THRESHOLD_MS = 10 * 60 * 1000
const DASHBOARD_CACHE_PREFIX = "cache:dashboard:"

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
    async function(){
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

type MaterialCounts = {
  [key: string]: number
}

type MonthlyData = {
  month: string
  bin: number
  [key: string]: number | string
}

// Counts disposals per material for a single date-bounded bucket without pulling
// disposal rows into memory: groupBy is bounded by bin count (small, fixed), not
// disposal volume, and the DB does the counting.
const countDisposalsByMaterial = async (
  start: Date | undefined,
  end: Date | undefined,
  binMaterialByBinId: Map<string, string>,
  baseMaterialCounts: MaterialCounts
) => {
  const grouped = await prisma.disposal.groupBy({
    by: ["binId"],
    where: start && end ? { createdAt: { gte: start, lte: end } } : undefined,
    _count: { _all: true },
  })

  const materialCounts = { ...baseMaterialCounts }
  let total = 0

  for (const row of grouped) {
    total += row._count._all
    const material = binMaterialByBinId.get(row.binId)
    if (material && material in materialCounts) {
      materialCounts[material] += row._count._all
    }
  }

  return { total, materialCounts }
}

export const getBarChartData = async (
  dateFrom?: Date,
  dateTo?: Date,
  filter?: string
): Promise<MonthlyData[]> => cached(
  `${DASHBOARD_CACHE_PREFIX}bar-chart:${dateFrom}:${dateTo}:${filter}`,
  DASHBOARD_TTL,
  async function(){
  try {
    const [binMaterials, bins] = await Promise.all([
      prisma.binMaterial.findMany({ select: { name: true } }),
      prisma.bin.findMany({
        select: { id: true, binMaterial: { select: { name: true } } },
      }),
    ])

    const baseMaterialCounts = binMaterials.reduce((acc: { [x: string]: number }, material: { name: string | number }) => {
      acc[material.name] = 0
      return acc
    }, {} as MaterialCounts)

    const binMaterialByBinId = new Map(bins.map((b) => [b.id, b.binMaterial.name]))

    const hasRange = filter !== "all" && filter !== "alltime" && dateFrom && dateTo

    // WEEK filter — one bucket per day within the (Mon–Sun) dateFrom..dateTo range
    if (filter === "week") {
      return await Promise.all(
        days.map(async (day, dayIndex) => {
          let start: Date | undefined
          let end: Date | undefined

          if (hasRange) {
            start = new Date(dateFrom!)
            start.setDate(start.getDate() + dayIndex)
            start.setHours(0, 0, 0, 0)

            end = new Date(start)
            end.setHours(23, 59, 59, 999)
          }

          const { total, materialCounts } = await countDisposalsByMaterial(
            start,
            end,
            binMaterialByBinId,
            baseMaterialCounts
          )

          return {
            month: day,
            bin: total,
            ...materialCounts,
          }
        })
      )
    }

    // MONTH filter
    if (filter === "month") {
      const weekRanges = getWeeksInMonth(dateFrom ?? new Date(), dateTo ?? new Date())
      // getWeeksInMonth's start/end were designed to be compared against
      // normalizeDate(d.createdAt) (raw + 8h SGT shift), not raw createdAt —
      // shift the bounds back by 8h so the DB-side comparison against the raw
      // column matches the original in-memory comparison exactly.
      const SGT_OFFSET_MS = 8 * 60 * 60 * 1000
      return await Promise.all(
        weekRanges.map(async ({ week, start, end }) => {
          const { total, materialCounts } = await countDisposalsByMaterial(
            new Date(start.getTime() - SGT_OFFSET_MS),
            new Date(end.getTime() - SGT_OFFSET_MS),
            binMaterialByBinId,
            baseMaterialCounts
          )

          return {
            month: week,
            bin: total,
            ...materialCounts,
          }
        })
      )
    }

    // DEFAULT = All Time (group by month)
    const year = (dateFrom ?? new Date()).getFullYear()
    return await Promise.all(
      months.map(async (month, monthIndex) => {
        let start: Date | undefined
        let end: Date | undefined

        if (hasRange) {
          start = new Date(year, monthIndex, 1, 0, 0, 0, 0)
          end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999)
        }

        const { total, materialCounts } = await countDisposalsByMaterial(
          start,
          end,
          binMaterialByBinId,
          baseMaterialCounts
        )

        return {
          month,
          bin: total,
          ...materialCounts,
        }
      })
    )
  } catch (error) {
    console.error("Error in disposal-based getBarChartData:", error)
    throw error
  }
  }
)

export const getPieChartData = async (
  dateFrom?: Date,
  dateTo?: Date,
  filter?: string
) => cached(
  `${DASHBOARD_CACHE_PREFIX}pie-chart:${dateFrom}:${dateTo}:${filter}`,
  DASHBOARD_TTL,
  async function(){
    const binsWithFaculty = await prisma.bin.findMany({
      include: {
        user: {
          select: {
            faculty: true,
          },
        },
      },
      where: {
        user: {
          role: "BIN" as Role,
        },
        createdAt: {
          gte: dateFrom,
          lte: dateTo,
        },
      },
    })

    const faculties = await prisma.user.groupBy({
      by: ["faculty"],
    })

    const binsByFaculty = faculties.reduce(
      (acc: Record<string, number>, faculty: { faculty: string | number }) => {
        acc[faculty.faculty] = 0
      return acc
      },
      {}
    )

    binsWithFaculty.forEach((bin) => {
      if (bin.user.faculty) {
        binsByFaculty[bin.user.faculty]++
      }
    })

    return Object.keys(binsByFaculty).map((faculty, index) => ({
      fac: faculty,
      count: binsByFaculty[faculty],
      fill: `hsl(${170 + index * 15}, 70%, 50%)`,
    }))
  }
)
