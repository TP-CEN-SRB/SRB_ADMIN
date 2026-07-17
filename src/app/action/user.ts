"use server"
import { prisma } from "@/lib/db"
import { Faculty, Role } from "@/generated/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { cached, DASHBOARD_TTL } from "@/lib/cache"

function capitalizeFirstLetter(name: string): string {
  const trimmedName = name?.trim()
  if (!trimmedName) {
    return ""
  }
  return trimmedName[0].toUpperCase() + trimmedName.slice(1)
}

export async function getAllBins(){
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


export async function getAllStudentUsers(
  page: number | null,
  query: string | null,
  sortOrder: string | undefined,
  sortItem: string | undefined,
  emailType: string | null,
  faculty: string | null
){
  const sessionData = await auth.api.getSession({
    headers: await headers() 
  })

  const sessionUser = sessionData?.user
  if (!sessionUser || sessionUser.role !== "admin") {
    return { error: "Unauthorized access!" }
  }
  const sortableItems = ["disposal", "point", "redemption"]
  const allowedEmailTypes = ["verified", "non-verified"]
  const pageCondition = page != null && page < 0
  const sortOrderCondition =
    sortOrder !== undefined && sortOrder !== "asc" && sortOrder !== "desc"
  const sortItemCondition =
    sortItem !== undefined && !Object.values(sortableItems).includes(sortItem)
  const emailTypeCondition =
    emailType &&
    !emailType.split(",").every((type) => allowedEmailTypes.includes(type))
  const facultyCondition =
    faculty &&
    !faculty
      .split(",")
      .every((f) => Object.values(Faculty).includes(f as Faculty))

  // check if all conditions are met
  if (
    pageCondition ||
    sortItemCondition ||
    sortOrderCondition ||
    emailTypeCondition ||
    facultyCondition
  ) {
    return { studentCount: 0, students: [] }
  }
  const isVerifiedSelected = emailType?.split(",").includes(allowedEmailTypes[0]); // "verified"
  const isNonVerifiedSelected = emailType?.split(",").includes(allowedEmailTypes[1]); // "non-verified"

  // Determine the boolean filter
  // If both or neither are selected, we want all users (undefined)
  // If only "verified" is selected, we want true
  // If only "non-verified" is selected, we want false
  const emailVerifiedFilter = (isVerifiedSelected && isNonVerifiedSelected) || (!isVerifiedSelected && !isNonVerifiedSelected)
    ? undefined
    : isVerifiedSelected
    ? true
    : false;
  const [studentCount, students] = await Promise.all([
    prisma.user.count({
      where: {
        role: "STUDENT",
        OR: query
          ? [
              { email: { contains: query, mode: "insensitive" } },
              { name: { contains: query, mode: "insensitive" } },
            ] : undefined,
        emailVerified: emailVerifiedFilter, // 👈 Clean and simple
      faculty: faculty ? { in: faculty.split(",") as Faculty[] } : undefined,
    },
  }),
  prisma.user.findMany({
    where: {
      role: "STUDENT",
      OR: query ? [
        { email: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ] : undefined,
        emailVerified: emailVerifiedFilter, // 👈 Same filter here
        faculty: faculty ? { in: faculty.split(",") as Faculty[] } : undefined,
      },
      take: page ? 10 : undefined,
      skip: page ? (page - 1) * 10 : 0,
      orderBy:
        sortItem === sortableItems[0]
          ? { disposals: { _count: sortOrder } }
          : sortItem === sortableItems[1]
          ? { point: { balance: sortOrder } }
          : sortItem === sortableItems[2]
          ? { redemptions: { _count: sortOrder } }
          : { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        faculty: true,
        profileImageUrl: true,
        point: { select: { balance: true, updatedAt: true } },
        _count: { select: { disposals: true, redemptions: true } },
        createdAt: true,
        updatedAt: true,
      },
    }),
  ])
  return { studentCount, students }
}

export const getTopTenUsers = async (dateFrom?: Date, dateTo?: Date) => cached(
  `cache:dashboard:top-users:${dateFrom}:${dateTo}`,
  DASHBOARD_TTL,
  async () => {
  // 1️⃣ Aggregate top users by points
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
          profileImageUrl: true, // ✅ ADD THIS
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
    // Treat null/undefined/missing as 0
          const safeCount = count ?? 0 
          
          return safeCount > (max[1] || 0)  ? [material, safeCount] : max
        },
          ["", 0]
        )[0]

      return {
        username: user?.name,
        userId,
        profileImageUrl: user?.profileImageUrl ?? null, // ✅ ADD THIS
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

export async function listOfBinManagersUsed() {
  const binManagers = await prisma.user.findMany({
    where: { role: "BIN" },
    select: {
      id: true,
      name: true,
      email: true,
      faculty: true,
      _count: { select: { bins: true } },
    },
  })
  return binManagers.map((binUser
  ) => ({
    id: binUser?.id as string,
    name: binUser?.name as string,
    email: binUser?.email as string,
    faculty: binUser?.faculty as Faculty,
    _count: { bins: binUser._count.bins as number },
  }))
}