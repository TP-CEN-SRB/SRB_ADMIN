"use server"

import { prisma } from "@/lib/db"
import { Role } from "@/generated/prisma"
import { cached, DASHBOARD_TTL } from "@/lib/cache"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const getTopTwentyUsers = async () => cached(
  "cache:dashboard:leaderboard-top20",
  DASHBOARD_TTL,
  async function(){
    const topUsers = await prisma.user.findMany({
      where: { role: Role.STUDENT, point: { isNot: null } },
      orderBy: { point: { balance: "desc" } },
      take: 20,
      select: {
        id: true,
        name: true,
        profileImageUrl: true,
        point: { select: { balance: true } },
      },
    })

    const userIds = topUsers.map((user) => user.id)

    if (userIds.length === 0) {
      return []
    }

    const [userDisposals, userRedemptions, allTestData] = await Promise.all([
      prisma.disposal.groupBy({
        by: ["userId"],
        _count: { id: true },
        where: { userId: { in: userIds } },
      }),
      prisma.redemption.groupBy({
        by: ["userId"],
        _count: { id: true },
        where: { userId: { in: userIds } },
      }),
      prisma.disposal.findMany({
        where: { userId: { in: userIds } },
        include: {
          user: { select: { id: true } },
          bin: {
            include: {
              binMaterial: { select: { id: true, name: true } },
            },
          },
        },
      }),
    ])

    return topUsers.map((user) => {
      const disposal = userDisposals.find((d) => d.userId === user.id) || {
        _count: { id: 0 },
      }

      const userTestData = allTestData.filter((t) => t.user?.id === user.id)
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
        username: user.name,
        userId: user.id,
        profileImageUrl: user.profileImageUrl ?? null,
        balance: user.point?.balance || 0,
        disposalCount: disposal._count.id,
        redemptionCount:
          userRedemptions.find((r) => r.userId === user.id)?._count?.id || 0,
        mostFrequentMaterial: mostFrequentMaterial || undefined,
      }
    })
  }
)

// The top-20 list above stays capped at 20 — this fetches the signed-in
// user's own rank/points separately so they can see where they stand even
// if they're outside that window. Returns null if they're not a ranked
// student (e.g. viewing as an admin with no Point row).
export const getMyRank = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  const userId = session?.user?.id
  if (!userId) return null

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      role: true,
      profileImageUrl: true,
      point: { select: { balance: true } },
    },
  })

  if (!me || me.role !== Role.STUDENT || !me.point) {
    return null
  }

  const [higherRankedCount, disposalCount, redemptionCount] = await Promise.all([
    prisma.user.count({
      where: {
        role: Role.STUDENT,
        point: { is: { balance: { gt: me.point.balance } } },
      },
    }),
    prisma.disposal.count({ where: { userId: me.id } }),
    prisma.redemption.count({ where: { userId: me.id } }),
  ])

  return {
    username: me.name,
    userId: me.id,
    profileImageUrl: me.profileImageUrl ?? null,
    balance: me.point.balance,
    disposalCount,
    redemptionCount,
    rank: higherRankedCount + 1,
  }
}
