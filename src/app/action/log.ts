"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ActivityLogSource } from "@/generated/prisma"

const isAdmin = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.role === "admin"
}

const getLogs = async (
  page: number,
  limit: number,
  search: string,
  source: string[],
  bins: string[] = []
) => {
  if (!(await isAdmin())) {
    return { logs: [], logCount: 0, totalPages: 1 }
  }

  const whereClause = {
    source: { in: source as ActivityLogSource[] },
    message: search ? { contains: search, mode: "insensitive" as const } : undefined,
    // Empty = no bin filter applied, rather than "match nothing".
    binId: bins.length > 0 ? { in: bins } : undefined,
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

// Bins that have actually logged something, for the filter dropdown and for
// labelling rows. Crashlog.binId is a bare string with no relation (bins that
// were deleted still have logs worth reading), so resolving ids to names is a
// manual second query rather than an include.
const getLogBins = async () => {
  if (!(await isAdmin())) {
    return []
  }

  const rows = await prisma.crashlog.findMany({
    where: { binId: { not: null } },
    distinct: ["binId"],
    select: { binId: true },
    orderBy: { binId: "asc" },
  })

  const binIds = rows
    .map(function (row) { return row.binId })
    .filter(function (id): id is string { return Boolean(id) })

  if (binIds.length === 0) {
    return []
  }

  const users = await prisma.user.findMany({
    where: { id: { in: binIds } },
    select: { id: true, name: true, location: true },
  })

  const labelById = new Map(
    users.map(function (user) { return [user.id, user.location || user.name] })
  )

  // Falls back to a short id so a log from a since-deleted bin is still
  // selectable instead of vanishing from the filter.
  return binIds.map(function (id) {
    return { value: id, label: labelById.get(id) || id.slice(0, 8) }
  })
}

export { getLogs, getLogBins }
