"use server"

import { prisma } from "@/lib/db"
import { BinStatus } from "@/generated/prisma"
import { z } from "zod"
import { DiagnosticComponentResultSchema, DiagnosticPayloadSchema } from "@/schemas"
import { sendBinFaultyEmail } from "@/lib/resend"
import { invalidateDashboardCache } from "@/app/action/dashboard"

// Cross-cutting bin actions shared by infrastructure entry points that
// aren't tied to a single admin page: the MQTT bridge (src/lib/mqtt.ts),
// the bin-diagnostic webhook, and the smart-alerts API route.

type DiagnosticComponentResult = z.infer<typeof DiagnosticComponentResultSchema>

const FailedComponentSchema = z.object({ id: z.string(), name: z.string() })
type FailedComponent = z.infer<typeof FailedComponentSchema>

interface BinAlert {
  id: string
  location: string
  material?: string
  capacity: number
  lastHeartBeat: Date | null
  alertLevel: "hardware" | "offline" | "critical"
  lat: number | null
  long: number | null
  hardwareFailed: boolean
  failedComponents: FailedComponent[]
  components: DiagnosticComponentResult[]
  lastDiagnosticAt: Date | null
}

export const getSmartAlerts = async function(){
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
  const alerts: BinAlert[] = []

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
    let failedComponents: FailedComponent[] = []
    let components: DiagnosticComponentResult[] = []

    if (binDiag?.details && typeof binDiag.details === "object") {
      const details = binDiag.details as { failedComponents?: unknown; allComponents?: unknown }

      const parsedFailed = FailedComponentSchema.array().safeParse(details.failedComponents)
      if (parsedFailed.success && parsedFailed.data.length > 0) {
        binHardwareFailed = true
        failedComponents = parsedFailed.data
      }

      const parsedAll = DiagnosticComponentResultSchema.array().safeParse(details.allComponents)
      if (parsedAll.success) {
        components = parsedAll.data
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

export const handleBinDiagnostic = async (binId: string, payload: unknown) => {
  try {
    const parsed = DiagnosticPayloadSchema.safeParse(payload)
    if (!parsed.success) {
      console.error("❌ Invalid diagnostic payload:", parsed.error.flatten())
      return { error: "Invalid diagnostic payload" }
    }

    const { timestamp, results, deviceType } = parsed.data

    // Ignore scanner diagnostics — they belong to ScannerDiagnosticLog
    if (deviceType === "scanner_unit_esp32") {
      console.warn("⚠️ Ignored scanner_unit_esp32 diagnostic for bin:", binId)
      return { ignored: true }
    }

    // Extract failed components
    const failedComponents = results
      .filter((r) => r.status === "failed")
      .map((r) => ({
        id: r.componentId,
        name: r.componentName,
      }))

    const anyFailed = failedComponents.length > 0

    // Component OK checks (only bin components)
    const lidOK = !results.some(
      (r) =>
        (r.componentId.includes("motor") ||
          r.componentId.includes("lid") ||
          r.componentId.includes("ultrasonic")) &&
        r.status === "failed"
    )

    const loadcellOK = !results.some(
      (r) => r.componentId.includes("loadcell") && r.status === "failed"
    )

    // Final bin status
    const overallStatus = anyFailed
      ? BinStatus.UNDER_MAINTENANCE
      : BinStatus.FUNCTIONAL

    const bin = await prisma.bin.findUnique({
      where: { id: binId },
      select: {
        status: true,
        userId: true,
        binMaterial: { select: { name: true } },
        user: { select: { location: true } },
      },
    })

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

    if (bin && bin.status !== overallStatus) {
      await invalidateDashboardCache()
    }

    // Notify subscribers only on the transition INTO Under Maintenance, not on
    // every subsequent diagnostic ping while the fault persists.
    if (bin && anyFailed && bin.status !== BinStatus.UNDER_MAINTENANCE) {
      const subscriptions = await prisma.subscription.findMany({
        where: { userId: bin.userId },
      })
      if (subscriptions.length > 0) {
        await sendBinFaultyEmail(
          subscriptions.map((s) => s.email),
          bin.binMaterial.name,
          bin.user.location,
          failedComponents
        )
      }
    }

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

// Logs an admin-issued bin command (open/close/up/down) to the activity
// log. There's no hardware ack topic for door state, so this logs the
// moment the command was successfully published over MQTT, not a
// confirmed physical door movement.
export const logBinCommand = async (binId: string, materialName: string, command: string) => {
  await prisma.crashlog.create({
    data: {
      source: "BIN_COMMAND",
      binId,
      message: `"${command}" command sent to ${materialName} bin (${binId})`,
    },
  })
}
