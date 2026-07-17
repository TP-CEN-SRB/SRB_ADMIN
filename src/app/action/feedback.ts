"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { FaultStatus } from "@/generated/prisma"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.role === "admin"
}

export const getFeedbacks = async (search: string) => {
  if (!(await requireAdmin())) return []

  return prisma.feedback.findMany({
    where: search
      ? {
          OR: [
            { category: { contains: search, mode: "insensitive" } },
            { user: { name: { contains: search, mode: "insensitive" } } },
            { user: { email: { contains: search, mode: "insensitive" } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  })
}

export const getFaultReports = async (search: string, status: string) => {
  if (!(await requireAdmin())) return []

  return prisma.faultReport.findMany({
    where: {
      status: status !== "ALL" ? (status as FaultStatus) : undefined,
      OR: search
        ? [
            { category: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
            { user: { name: { contains: search, mode: "insensitive" } } },
            { user: { email: { contains: search, mode: "insensitive" } } },
          ]
        : undefined,
    },
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
      takenByTelegramName: true,
      resolvedByTelegramName: true,
      takenByAdminName: true,
      resolvedByAdminName: true,
      user: { select: { id: true, name: true, email: true } },
    },
  })
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
