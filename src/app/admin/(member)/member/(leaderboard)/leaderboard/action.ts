"use server"

import { prisma } from "@/lib/db"
import { Role } from "@/generated/prisma"
import { cached, DASHBOARD_TTL } from "@/lib/cache"

export const getTopTwentyUsers = async () => cached(
  "cache:dashboard:leaderboard-top20",
  DASHBOARD_TTL,
  async function(){
    const topUsers = await prisma.user.findMany({
      where: { role: Role.STUDENT },
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
