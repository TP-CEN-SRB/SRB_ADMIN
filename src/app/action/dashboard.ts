"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { cached, DASHBOARD_TTL } from "@/lib/cache"
import { DateRange, getWeeksInMonth, months, days, normalizeDate } from "@/utils/dateUtils"
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

export const getBarChartData = async (
  dateFrom?: Date,
  dateTo?: Date,
  filter?: string
): Promise<MonthlyData[]> => cached(
  `${DASHBOARD_CACHE_PREFIX}bar-chart:${dateFrom}:${dateTo}:${filter}`,
  DASHBOARD_TTL,
  async function(){
  try {
    const binMaterials = await prisma.binMaterial.findMany({
      select: { name: true },
    })

    const baseMaterialCounts = binMaterials.reduce((acc: { [x: string]: number }, material: { name: string | number }) => {
      acc[material.name] = 0
      return acc
    }, {} as MaterialCounts)

    const allDisposals = await prisma.disposal.findMany({
      where: {
        ...(filter !== "all" && filter !== "alltime" && dateFrom && dateTo
          ? {
              createdAt: {
                gte: dateFrom,
                lte: dateTo,
              },
            }
          : {}),
      },
      include: {
        bin: {
          select: {
            binMaterial: { select: { name: true } },
          },
        },
      },
    })

    // WEEK filter
    if (filter === "week") {
      return await Promise.all(
        days.map(async (day, dayIndex) => {
          const filtered = allDisposals.filter(
            (d) => new Date(d.createdAt).getDay() === (dayIndex + 1) % 7
          )

          const materialCounts = { ...baseMaterialCounts }
          filtered.forEach((d: { bin: { binMaterial: { name: any } } }) => {
            const material = d.bin.binMaterial.name
            if (material in materialCounts) {
              materialCounts[material]++
            }
          })

          return {
            month: day,
            bin: filtered.length,
            ...materialCounts,
          }
        })
      )
    }

    // MONTH filter
    if (filter === "month") {
      const weekRanges = getWeeksInMonth(dateFrom ?? new Date(), dateTo ?? new Date())
      return await Promise.all(
        weekRanges.map(async ({ week, start, end }) => {
          const filtered = allDisposals.filter((d) => {
            const date = normalizeDate(new Date(d.createdAt))
            return date >= start && date <= end
          })

          const materialCounts = { ...baseMaterialCounts }
          filtered.forEach((d: { bin: { binMaterial: { name: any } } }) => {
            const material = d.bin.binMaterial.name
            if (material in materialCounts) {
              materialCounts[material]++
            }
          })

          return {
            month: week,
            bin: filtered.length,
            ...materialCounts,
          }
        })
      )
    }

    // DEFAULT = All Time (group by month)
    return await Promise.all(
      months.map(async (month, monthIndex) => {
        const filtered = allDisposals.filter(
          (d) => new Date(d.createdAt).getMonth() === monthIndex
        )

        const materialCounts = { ...baseMaterialCounts }
        filtered.forEach((d: { bin: { binMaterial: { name: any } } }) => {
          const material = d.bin.binMaterial.name
          if (material in materialCounts) {
            materialCounts[material]++
          }
        })

        return {
          month,
          bin: filtered.length,
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
