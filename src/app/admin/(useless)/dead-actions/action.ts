"use server"

// Orphaned server actions with zero live callers, kept here for reference.
// See ../README.md for the criteria used to identify dead code in this pass.

import { prisma } from "@/lib/db"
import { Bin, BinStatus, Prisma, Role } from "@/generated/prisma"
import { cached, DASHBOARD_TTL } from "@/lib/cache"

const DASHBOARD_CACHE_PREFIX = "cache:dashboard:"

// --- formerly action/user.ts ---

export async function getAllBins() {
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

export const getTopTenUsers = async (dateFrom?: Date, dateTo?: Date) => cached(
  `cache:dashboard:top-users:${dateFrom}:${dateTo}`,
  DASHBOARD_TTL,
  async () => {
  const aggregated = await prisma.disposal.groupBy({
    by: ["userId"],
    where: {
      user: {
        role: Role.STUDENT,
      },
      isRedeemed: true,
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
    },
    _sum: {
      pointsAwarded: true,
    },
    orderBy: {
      _sum: { pointsAwarded: "desc" },
    },
    take: 10,
  })

  const userIds = aggregated
    .map((user) => user.userId)
    .filter((id) => id !== null)

  if (userIds.length === 0) {
    return []
  }

  const [userDisposals, userRedemptions, allTestData] = await Promise.all([
    prisma.disposal.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
      where: {
        userId: {
          in: userIds,
        },
      },
    }),
    prisma.redemption.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
      where: {
        userId: {
          in: userIds,
        },
      },
    }),
    prisma.disposal.findMany({
      where: {
        userId: {
          in: userIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
        bin: {
          include: {
            binMaterial: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }),
  ])

  const orderedDisposals = await Promise.all(
    userIds.map(async (userId) => {
      const disposal = userDisposals.find((d) => d.userId === userId) || {
        _count: { id: 0 },
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          profileImageUrl: true,
        },
      })

      const userTestData = allTestData.filter((t) => t.user?.id === userId)
      const materialCounts = userTestData.reduce((acc: { [x: string]: any }, item: { bin: { binMaterial: { name: any } } }) => {
        const materialName = item.bin?.binMaterial?.name
        if (materialName) {
          acc[materialName] = (acc[materialName] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)

      const mostFrequentMaterial = Object.entries(materialCounts).reduce(
        (max, [material, count]) => {
          const safeCount = count ?? 0
          return safeCount > (max[1] || 0) ? [material, safeCount] : max
        },
        ["", 0]
      )[0]

      return {
        username: user?.name,
        userId,
        profileImageUrl: user?.profileImageUrl ?? null,
        balance:
          aggregated.find((d: { userId: any }) => d.userId === userId)?._sum.pointsAwarded || 0,
        disposalCount: disposal._count.id,
        redemptionCount:
          userRedemptions.find((r: { userId: any }) => r.userId === userId)?._count?.id || 0,
        mostFrequentMaterial: mostFrequentMaterial || undefined,
      }
    })
  )

  return orderedDisposals.sort((a: { balance: number }, b: { balance: number }) => b.balance - a.balance)
  }
)

// --- formerly action/binMaterial.ts ---

export const getAllBinsWithMaterial = async (id: string) => {
  const bins = await prisma.bin.findMany({
    where: {
      binMaterialId: id,
    },
  })
  return bins
}

// --- formerly action/bin.ts ---

export const getUsedMaterialsForBin = async (userId: string) => {
  const usedBinMaterials = await prisma.bin.findMany({
    where: {
      userId,
    },
    select: {
      binMaterial: {
        select: {
          name: true,
        },
      },
    },
  })
  return usedBinMaterials
}

interface BinCount {
  binType: string
  binCount: number
  fill: string
}

export const getBinCountsByMaterial = async (
  dateFrom?: Date,
  dateTo?: Date
): Promise<BinCount[]> => cached(
  `${DASHBOARD_CACHE_PREFIX}bin-counts-by-material:${dateFrom}:${dateTo}`,
  DASHBOARD_TTL,
  async () => {
    const binCounts = await prisma.bin.groupBy({
      by: ["binMaterialId"],
      where: {
        createdAt: {
          gte: dateFrom || undefined,
          lte: dateTo || undefined,
        },
      },
      _count: {
        _all: true,
      },
    })

    const allMaterials = await prisma.binMaterial.findMany({
      select: {
        id: true,
        name: true,
      },
    })

    const countMap = new Map(
      binCounts.map((count) => [count.binMaterialId, count._count._all])
    )

    return allMaterials.map((material, index) => ({
      binType: material.name,
      binCount: countMap.get(material.id) || 0,
      fill: `hsl(${170 + index * 15}, 70%, 50%)`,
    }))
  }
)

export const getBinCountsByStatus = async (
  dateFrom?: Date,
  dateTo?: Date,
  notFunctional?: boolean,
  filter?: string
) => {
  let bins: Bin[] = []

  const whereClause: Prisma.BinWhereInput = {}

  whereClause.createdAt = {
    gte: dateFrom,
    lte: dateTo,
  }

  whereClause.status = notFunctional
    ? BinStatus.UNDER_MAINTENANCE
    : BinStatus.FUNCTIONAL

  bins = await prisma.bin.findMany({
    where: whereClause,
  })

  return bins.length
}

export const getDisposals = async (dateFrom?: Date, dateTo?: Date) => cached(
  `${DASHBOARD_CACHE_PREFIX}disposals-count:${dateFrom}:${dateTo}`,
  DASHBOARD_TTL,
  async () => {
    const adjustedEndDate = dateTo ? new Date(dateTo) : undefined
    if (adjustedEndDate) {
      adjustedEndDate.setHours(23, 59, 59, 999)
    }
    const disposals = await prisma.disposal.findMany({
      where: {
        createdAt: {
          gte: dateFrom,
          lte: adjustedEndDate,
        },
      },
      select: {
        id: true,
      },
    })
    return disposals.length
  }
)

type DisposalsByHour = {
  hour: string
  [key: string]: string | number
}

export const getBinDisposalsByTime = async (
  dateFrom?: Date,
  dateTo?: Date,
  filter?: string
): Promise<DisposalsByHour[]> => cached(
  `${DASHBOARD_CACHE_PREFIX}disposals-by-time:${dateFrom}:${dateTo}:${filter}`,
  DASHBOARD_TTL,
  async () => {

  const whereClause: Prisma.DisposalWhereInput = {}

  whereClause.createdAt = {
    gte: dateFrom,
    lte: dateTo,
  }

  const [binMaterials, totalDisposals] = await Promise.all([
    prisma.binMaterial.findMany({
      select: {
        name: true,
      },
    }),
    prisma.disposal.findMany({
      include: {
        bin: {
          select: {
            binMaterial: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      where: whereClause,
      orderBy: {
        createdAt: "asc",
      },
    }),
  ])

  const hours = Array.from({ length: 18 }, (_, i) => {
    const hour = i + 6
    return hour.toString().padStart(2, "0") + "00"
  })

  const result: DisposalsByHour[] = hours.map((hour) => ({
    hour,
    ...Object.fromEntries(binMaterials.map((material) => [material.name, 0])),
  }))

  totalDisposals.forEach((disposal: { createdAt: string | number | Date; bin: { binMaterial: { name: any } } }) => {
    const utc8Time = new Date(disposal.createdAt)
    utc8Time.setHours(utc8Time.getUTCHours() + 8)

    const hour = utc8Time.getHours()
    if (hour >= 6 && hour <= 23) {
      const hourIndex = hour - 6
      const materialName = disposal.bin.binMaterial.name
      if (result[hourIndex]) {
        result[hourIndex][materialName] =
          (result[hourIndex][materialName] as number) + 1
      }
    }
  })

  return result
  }
)

export const getDisposalDates = async (): Promise<string[]> => cached(
  `${DASHBOARD_CACHE_PREFIX}disposal-dates`,
  DASHBOARD_TTL,
  async () => {
    const disposalDates = await prisma.disposal.findMany({
      select: { createdAt: true },
    })

    const uniqueDateStrings = Array.from(
      new Set<string>(
        disposalDates.map((d) =>
          new Date(d.createdAt).toISOString().split("T")[0]
        )
      )
    )

    return uniqueDateStrings
  }
)

export const getFaultyBins = async (
  dateFrom?: Date,
  dateTo?: Date,
  filter?: string
) => {
  const faultyBins = await prisma.bin.findMany({
    select: {
      id: true,
      user: {
        select: {
          location: true,
          lat: true,
          long: true,
        },
      },
      binMaterial: {
        select: {
          name: true,
        },
      },
    },
    where: {
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
      status: BinStatus.UNDER_MAINTENANCE,
    },
  })

  return faultyBins.map((bin) => ({
    ...bin,
    user: {
      ...bin.user,
      lat: bin.user.lat && bin.user.lat.toString(),
      long: bin.user.long && bin.user.long.toString(),
    },
  }))
}

export const evaluateHardwareStatus = async (diag: any) => {
  const failed: string[] = []

  if (diag.scannerOK === false) failed.push("Scanner")
  if (diag.lidOK === false) failed.push("Lid Motor")
  if (diag.loadcellOK === false) failed.push("Load Cell")

  return {
    isCriticalFailure: failed.length > 0,
    failedComponents: failed,
  }
}

export const fetchDashboardData = async (startDate?: Date, endDate?: Date, filter?: string) => {
  const [totalFuncBins, totalUMBins, totalDisposalCount, totalCount] = await Promise.all([
    getBinCountsByStatus(startDate, endDate, false, filter),
    getBinCountsByStatus(startDate, endDate, true, filter),
    getDisposals(startDate, endDate),
    prisma.bin.count({
      where: { createdAt: { gte: startDate, lte: endDate } },
    }),
  ])

  return { totalFuncBins, totalCount, totalDisposalCount, totalUMBins }
}

export const fetchUMBinsData = async (startDate?: Date, endDate?: Date, filter?: string) => {
  const UMBinsData = await getFaultyBins(startDate, endDate, filter)
  return UMBinsData
}

export const fetchAll = async (startDate?: Date, endDate?: Date, filter?: string) => {
  const [dashboardData, UMBinsData] = await Promise.all([
    fetchDashboardData(startDate, endDate, filter),
    fetchUMBinsData(startDate, endDate, filter),
  ])

  return { dashboardData, UMBinsData }
}
