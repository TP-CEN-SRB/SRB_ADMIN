"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ActivityLogSource } from "@/generated/prisma"

const getLogs = async (page: number, limit: number, search: string, source: string[]) => {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user
  if (user?.role !== "admin") {
    return { logs: [], logCount: 0, totalPages: 1 }
  }

  const whereClause = {
    source: { in: source as ActivityLogSource[] },
    message: search ? { contains: search, mode: "insensitive" as const } : undefined,
  }

  const [logCount, logs] = await Promise.all([
    prisma.crashlog.count({ where: whereClause }),
    prisma.crashlog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        message: true,
        source: true,
        binId: true,
        createdAt: true,
      },
    }),
  ])

  return { logs, logCount, totalPages: Math.max(1, Math.ceil(logCount / limit)) }
}

export { getLogs }
