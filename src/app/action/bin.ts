"use server"

import { prisma } from "@/lib/db"
import { BinStatus } from "@/generated/prisma"

// Cross-cutting bin actions shared by infrastructure entry points that
// aren't tied to a single admin page: the MQTT bridge (src/lib/mqtt.ts),
// the bin-diagnostic webhook, and the smart-alerts API route.

export const getSmartAlerts = async () => {
  const bins = await prisma.bin.findMany({
    include: {
      user: {
        select: {
          location: true,
          lat: true,
          long: true,
        },
      },
      binMaterial: { select: { name: true } },
    },
  })

  const now = Date.now()

  // ============================
  // BIN DIAGNOSTICS
  // ============================
  const binDiags = await prisma.binDiagnosticLog.groupBy({
    by: ["binId"],
    _max: { timestamp: true },
  })

  const latestBinLogs = await prisma.binDiagnosticLog.findMany({
    where: {
      timestamp: {
        in: binDiags
          .map((d) => d._max.timestamp)
          .filter((t): t is Date => !!t),
      },
    },
  })

  const binLogsByBin = new Map<string, typeof latestBinLogs[number]>()
  latestBinLogs.forEach((log) => binLogsByBin.set(log.binId, log))

  // ============================
  // SCANNER DIAGNOSTICS
  // ============================
  const scannerDiags = await prisma.scannerDiagnosticLog.groupBy({
    by: ["userId"],
    _max: { timestamp: true },
  })

  const latestScannerLogs = await prisma.scannerDiagnosticLog.findMany({
    where: {
      timestamp: {
        in: scannerDiags
          .map((d) => d._max.timestamp)
          .filter((t): t is Date => !!t),
      },
    },
  })

  const scannerLogsByUser = new Map<
    string,
    typeof latestScannerLogs[number]
  >()
  latestScannerLogs.forEach((log: typeof latestScannerLogs[number]) =>
    scannerLogsByUser.set(log.userId, log)
  )

  // ============================
  // ALERT EVALUATION
  // ============================
  const alerts: any[] = []

  for (const bin of bins) {
    const last = bin.lastHeartBeat
      ? new Date(bin.lastHeartBeat).getTime()
      : 0

    const isOnline = last && now - last < 10 * 60 * 1000
    const isFull = bin.currentCapacity >= 75

    // ----------------------------
    // BIN HARDWARE CHECK
    // ----------------------------
    const binDiag = binLogsByBin.get(bin.id)

    let binHardwareFailed = false
    let failedComponents: { id: string; name: string }[] = []
    let components: any[] = []

    if (binDiag?.details && typeof binDiag.details === "object") {
      const d = binDiag.details as any

      if (Array.isArray(d.failedComponents) && d.failedComponents.length > 0) {
        binHardwareFailed = true
        failedComponents = d.failedComponents
      }

      if (Array.isArray(d.allComponents)) {
        components = d.allComponents
      }
    }

    // ----------------------------
    // PRIORITY (BIN ONLY)
    // ----------------------------
    let level: "hardware" | "offline" | "critical" | null = null

    if (binHardwareFailed) level = "hardware"
    else if (!isOnline) level = "offline"
    else if (isFull) level = "critical"

    if (!level) continue

    alerts.push({
      id: bin.id,
      location: bin.user?.location ?? "Unknown",
      material: bin.binMaterial?.name,
      capacity: bin.currentCapacity,
      lastHeartBeat: bin.lastHeartBeat,
      alertLevel: level,

      lat: bin.user.lat ? Number(bin.user.lat) : null,
      long: bin.user.long ? Number(bin.user.long) : null,

      hardwareFailed: binHardwareFailed,
      failedComponents,
      components,
      lastDiagnosticAt: binDiag?.timestamp ?? null,
    })
  }

  return alerts
}

export const handleBinDiagnostic = async (binId: string, payload: any) => {
  try {
    const { timestamp, results, deviceType } = payload

    if (!Array.isArray(results)) {
      console.error("❌ Diagnostic payload missing results[] array")
      return { error: "Invalid diagnostic payload" }
    }

    // Ignore scanner diagnostics — they belong to ScannerDiagnosticLog
    if (deviceType === "scanner_unit_esp32") {
      console.warn("⚠️ Ignored scanner_unit_esp32 diagnostic for bin:", binId)
      return { ignored: true }
    }

    // Extract failed components
    const failedComponents = results
      .filter((r: any) => r.status === "failed")
      .map((r: any) => ({
        id: r.componentId,
        name: r.componentName,
      }))

    const anyFailed = failedComponents.length > 0

    // Component OK checks (only bin components)
    const lidOK = !results.some(
      (r: any) =>
        (r.componentId?.includes("motor") ||
          r.componentId?.includes("lid") ||
          r.componentId?.includes("ultrasonic")) &&
        r.status === "failed"
    )

    const loadcellOK = !results.some(
      (r: any) => r.componentId?.includes("loadcell") && r.status === "failed"
    )

    // Final bin status
    const overallStatus = anyFailed
      ? BinStatus.UNDER_MAINTENANCE
      : BinStatus.FUNCTIONAL

    // Save log entry
    await prisma.binDiagnosticLog.create({
      data: {
        binId,
        timestamp: typeof timestamp === "number" ? new Date() : new Date(timestamp),
        scannerOK: true, // always true (bins do not track scanner kiosk)
        lidOK,
        loadcellOK,
        overallStatus,
        details: {
          failedComponents,
          allComponents: results,
        },
      },
    })

    // Update bin status
    await prisma.bin.update({
      where: { id: binId },
      data: { status: overallStatus },
    })

    if (anyFailed) {
      return {
        alert: {
          binId,
          failedComponents,
          timestamp,
        },
      }
    }

    return { success: true }
  } catch (error) {
    console.error("❌ handleBinDiagnostic error:", error)
    return { error: "Failed to process diagnostic" }
  }
}
