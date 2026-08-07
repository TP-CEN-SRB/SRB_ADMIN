"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { cached, invalidateByPrefix, DASHBOARD_TTL } from "@/lib/cache"
import { computeBinUptime } from "@/lib/uptime"
import { DateRange, getWeeksInMonth, months, days } from "@/utils/dateUtils"
import { format } from "date-fns"
import { BinStatus, Role } from "@/generated/prisma"

export type DashboardPeriod = "day" | "week" | "month" | "year"

const ONLINE_THRESHOLD_MS = 10 * 60 * 1000
const DASHBOARD_CACHE_PREFIX = "cache:dashboard:"

// Bin mutations (create/update/delete/capacity/diagnostic/heartbeat) affect the
// aggregates cached below — call this after any of them so dashboard numbers
// don't lag behind by up to DASHBOARD_TTL seconds.
export const invalidateDashboardCache = async () => invalidateByPrefix(DASHBOARD_CACHE_PREFIX)

export const getDashboardStats = async (period: DashboardPeriod, offset: number = 0) => {
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

  const { startDate, endDate } = DateRange(period, offset)

  return cached(
    `cache:dashboard:stats:${period}:${offset}`,
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
            month: start ? format(start, "d/M") : day,
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
        weekRanges.map(async ({ start, end }) => {
          const { total, materialCounts } = await countDisposalsByMaterial(
            new Date(start.getTime() - SGT_OFFSET_MS),
            new Date(end.getTime() - SGT_OFFSET_MS),
            binMaterialByBinId,
            baseMaterialCounts
          )

          return {
            month: format(start, "d/M"),
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
          month: start ? format(start, "MMM") : month,
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
    // Bins are a static roster (registered once, not re-created per period),
    // so this must NOT be scoped by createdAt like the disposal-based charts
    // above — that bug made the chart empty for any period without a
    // brand-new bin registration in it (i.e. almost always).
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

export type FleetUptimeHour = { hour: string; uptimePct: number | null }

// Fleet-wide counterpart to /api/uptime (which is scoped to one bin
// manager): reuses the same Redis uptime:<binId>:<bucketISO> snapshots via
// computeBinUptime, then averages across every bin per hourly bucket over
// the last rolling 24h. A null hour means no bin reported any heartbeat in
// that bucket (not the same as 0% — 0% means bins reported and were down).
export const getFleetUptimeByHour = async (): Promise<FleetUptimeHour[]> =>
  cached(
    `${DASHBOARD_CACHE_PREFIX}fleet-uptime:day`,
    DASHBOARD_TTL,
    async function () {
      const bins = await prisma.bin.findMany({
        select: { id: true, binMaterial: { select: { name: true } } },
      })
      if (bins.length === 0) return []

      const perBin = await computeBinUptime(
        bins.map((b) => ({ id: b.id, name: b.binMaterial.name })),
        "day"
      )

      const bucketCount = perBin[0]?.uptimeTimeline.length ?? 0
      return Array.from({ length: bucketCount }, (_, i) => {
        const entry = perBin[0].uptimeTimeline[i]
        const vals = perBin
          .map((b) => b.uptimeTimeline[i]?.uptime)
          .filter((v): v is number => v !== null && v !== undefined)

        return {
          hour: entry.label,
          uptimePct: vals.length
            ? Math.round(vals.reduce((a, v) => a + v, 0) / vals.length)
            : null,
        }
      })
    }
  )

export type DisposalHourBucket = { hour: string; count: number }

// Histogram of disposal counts by hour-of-day (Singapore local time) within
// the given range — reveals when users actually use the bins, independent
// of which specific day each disposal fell on.
export const getDisposalsByHour = async (
  dateFrom?: Date,
  dateTo?: Date
): Promise<DisposalHourBucket[]> =>
  cached(
    `${DASHBOARD_CACHE_PREFIX}disposals-by-hour:${dateFrom}:${dateTo}`,
    DASHBOARD_TTL,
    async function () {
      const disposals = await prisma.disposal.findMany({
        where: { createdAt: { gte: dateFrom, lte: dateTo } },
        select: { createdAt: true },
      })

      const counts = new Array(24).fill(0)
      for (const d of disposals) {
        // Re-anchor to SGT before reading the hour, same trick used in
        // /api/uptime's toSGT — otherwise this histogram reports the UTC
        // hour, silently shifted 8h from when people actually disposed.
        const sgt = new Date(
          d.createdAt.toLocaleString("en-US", { timeZone: "Asia/Singapore" })
        )
        counts[sgt.getHours()]++
      }

      return counts.map((count, hour) => ({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        count,
      }))
    }
  )
