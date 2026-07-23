"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { FaultStatus } from "@/generated/prisma"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.role === "admin"
}

export const getFeedbacks = async (search: string, page: number, limit: number) => {
  if (!(await requireAdmin())) return { feedbacks: [], feedbackCount: 0, totalPages: 1 }

  const whereClause = search
    ? {
        OR: [
          { category: { contains: search, mode: "insensitive" as const } },
          { user: { name: { contains: search, mode: "insensitive" as const } } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
        ],
      }
    : undefined

  const [feedbackCount, feedbacks] = await Promise.all([
    prisma.feedback.count({ where: whereClause }),
    prisma.feedback.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
  ])

  return { feedbacks, feedbackCount, totalPages: Math.max(1, Math.ceil(feedbackCount / limit)) }
}

export const getFaultReports = async (search: string, status: string, page: number, limit: number) => {
  if (!(await requireAdmin())) return { reports: [], reportCount: 0, totalPages: 1 }

  const whereClause = {
    status: status !== "ALL" ? (status as FaultStatus) : undefined,
    OR: search
      ? [
          { category: { contains: search, mode: "insensitive" as const } },
          { location: { contains: search, mode: "insensitive" as const } },
          { user: { name: { contains: search, mode: "insensitive" as const } } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
        ]
      : undefined,
  }

  const [reportCount, reports] = await Promise.all([
    prisma.faultReport.count({ where: whereClause }),
    prisma.faultReport.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        location: true,
        category: true,
        type: true,
        description: true,
        faultimageUrl: true,
        status: true,
        createdAt: true,
        takenByTelegramName: true,
        resolvedByTelegramName: true,
        takenByAdminName: true,
        resolvedByAdminName: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
  ])

  return { reports, reportCount, totalPages: Math.max(1, Math.ceil(reportCount / limit)) }
}

export const getFeedbacksForUser = async (userId: string) => {
  if (!(await requireAdmin())) return []

  return prisma.feedback.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  })
}

export const getFaultReportsForUser = async (userId: string) => {
  if (!(await requireAdmin())) return []

  return prisma.faultReport.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      location: true,
      category: true,
      type: true,
      description: true,
      faultimageUrl: true,
      status: true,
      createdAt: true,
    },
  })
}
