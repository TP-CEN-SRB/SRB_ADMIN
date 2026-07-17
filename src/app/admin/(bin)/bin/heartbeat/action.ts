"use server"

import { prisma } from "@/lib/db"
import { BinStatus } from "@/generated/prisma"

export const getHeartbeat = async () => {
  const bins = await prisma.bin.findMany({
    select: {
      id: true,
      status: true,
      currentCapacity: true,
      lastHeartBeat: true,
      userId: true,
      binMaterial: { select: { name: true } },
      user: { select: { name: true } },
    },
  })

  const now = new Date()

  // STEP 1 — Find newest diagnostic timestamp per bin
  const diagnostics = await prisma.binDiagnosticLog.groupBy({
    by: ["binId"],
    _max: { timestamp: true },
  })

  const latestTimestamps = new Map(
    diagnostics.map((d) => [d.binId, d._max.timestamp])
  )

  const timestamps = Array.from(latestTimestamps.values()).filter(
    (t): t is Date => t !== null
  )

  const latestLogs = await prisma.binDiagnosticLog.findMany({
    where: {
      timestamp: { in: timestamps },
    },
  })

  const logsByBin = new Map<string, typeof latestLogs[number]>()
  latestLogs.forEach((log) => logsByBin.set(log.binId, log))

  // STEP 2 — Evaluate each bin
  const evaluated = bins.map((bin) => {
    const isOnline =
      bin.lastHeartBeat &&
      now.getTime() - new Date(bin.lastHeartBeat).getTime() < 1000 * 60 * 10

    let effectiveStatus: BinStatus = BinStatus.FUNCTIONAL

    if (!isOnline) {
      effectiveStatus = BinStatus.UNDER_MAINTENANCE
    } else {
      const diag = logsByBin.get(bin.id)
      if (diag) {
        const failed = []

        if (!diag.scannerOK) failed.push("scanner")
        if (!diag.lidOK) failed.push("lid motor")
        if (!diag.loadcellOK) failed.push("loadcell")

        if (failed.length > 0) {
          effectiveStatus = BinStatus.UNDER_MAINTENANCE
        }
      }
    }

    return { ...bin, isOnline, effectiveStatus }
  })

  // STEP 3 — Sync DB statuses only if changed
  await Promise.all(
    evaluated.map((bin) => {
      if (bin.status !== bin.effectiveStatus) {
        return prisma.bin.update({
          where: { id: bin.id },
          data: { status: bin.effectiveStatus },
        })
      }
      return null
    })
  )

  return evaluated
}
