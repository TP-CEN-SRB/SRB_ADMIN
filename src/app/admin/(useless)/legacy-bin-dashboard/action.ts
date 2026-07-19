"use server"

import { prisma } from "@/lib/db"
import { cached, DASHBOARD_TTL } from "@/lib/cache"

const DASHBOARD_CACHE_PREFIX = "cache:dashboard:"

export const getDisposalsByFaculty = async (
  dateFrom?: Date,
  dateTo?: Date
) => cached(
  `${DASHBOARD_CACHE_PREFIX}disposals-by-faculty:${dateFrom}:${dateTo}`,
  DASHBOARD_TTL,
  async function(){
  const adjustedEndDate = dateTo ? new Date(dateTo) : undefined
  if (adjustedEndDate) {
    adjustedEndDate.setHours(23, 59, 59, 999)
  }

  const faculties = await prisma.user.groupBy({
    by: ["faculty"],
  })

  const disposalCounts = faculties.reduce(
    (acc: Record<string, number>, faculty: { faculty: string | number }) => {
      acc[faculty.faculty] = 0
      return acc
    },
    {}
  )

  const disposals = await prisma.disposal.findMany({
    where: {
      createdAt: {
        gte: dateFrom,
        lte: adjustedEndDate,
      },
      bin: {
        user: {
          role: "BIN",
        },
      },
    },
    include: {
      bin: {
        include: {
          user: {
            select: {
              faculty: true,
            },
          },
        },
      },
    },
  })

  disposals.forEach((disposal: { bin: { user: { faculty: any } } }) => {
    const faculty = disposal.bin?.user?.faculty
    if (faculty) {
      disposalCounts[faculty]++
    }
  })

  return Object.entries(disposalCounts).map(([faculty, count], index) => ({
    fac: faculty,
    count,
    fill: `hsl(${170 + index * 15}, 70%, 50%)`,
  }))
  }
)
