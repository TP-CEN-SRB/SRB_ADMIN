import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client";
import { sendTelegramAlert } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// ---------------------------
// TIME FORMAT (SGT)
// ---------------------------
const toSGT = (date = new Date()) =>
  date.toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    hour12: false,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }) + " SGT";

type AlertLevel = "hardware" | "offline" | "critical" | "full" | null;

// Dashboard-matching bin evaluator
function evaluateBinAlert(args: {
  hasEverReported: boolean;
  isOnline: boolean;
  capacity: number;
  binDiag: any | null;
}): { level: AlertLevel; failedComponents: string[] } {
  const { hasEverReported, isOnline, capacity, binDiag } = args;

  // 🔑 IMPORTANT: never-online bins should not trigger alerts
  if (!hasEverReported) return { level: null, failedComponents: [] };

  // 1) hardware
  const failed =
    binDiag?.details?.failedComponents && Array.isArray(binDiag.details.failedComponents)
      ? binDiag.details.failedComponents.map((c: any) => c?.name).filter(Boolean)
      : [];

  if (failed.length > 0) return { level: "hardware", failedComponents: failed };

  // 2) offline
  if (!isOnline) return { level: "offline", failedComponents: [] };

  // 3) full
  if (capacity === 100) return { level: "full", failedComponents: [] };

  // 4) critical (almost full)
  if (capacity >= 75) return { level: "critical", failedComponents: [] };

  return { level: null, failedComponents: [] };
}

export async function POST() {
  try {
    const TIMEOUT = 10 * 60 * 1000; // 10 minutes
    const now = Date.now();

    // ========================================
    // 1) BINS: status sync + telegram alerts
    // ========================================
    const bins = await prisma.bin.findMany({
      select: {
        id: true,
        lastHeartBeat: true,
        status: true,                 // Functional / UM
        alertLevel: true,             // NEW: telegram state
        currentCapacity: true,        // needed for critical/full
        binMaterial: { select: { name: true } },
        user: { select: { location: true } },
      },
    });

    for (const bin of bins) {
      const last = bin.lastHeartBeat ? new Date(bin.lastHeartBeat).getTime() : null;

      const hasEverReported = last !== null;
      const isOnline = last !== null && now - last < TIMEOUT;

      // ----------------------------
      // A) Keep your EXISTING status logic
      // ----------------------------
      let newStatus: BinStatus = isOnline
        ? BinStatus.FUNCTIONAL
        : BinStatus.UNDER_MAINTENANCE;

      // If online, check bin diagnostics to possibly set UM
      let lastDiag: any | null = null;
      if (isOnline) {
        lastDiag = await prisma.binDiagnosticLog.findFirst({
          where: { binId: bin.id },
          orderBy: { timestamp: "desc" },
        });

        if (lastDiag) {
          newStatus = lastDiag.overallStatus;
        }
      }

      // Update DB status if changed (dashboard relies on this too)
      if (newStatus !== bin.status) {
        await prisma.bin.update({
          where: { id: bin.id },
          data: { status: newStatus },
        });
      }

      // ----------------------------
      // B) Dashboard-matching alert evaluation (hardware/offline/full/critical)
      // ----------------------------
      const { level: nextAlertLevel, failedComponents } = evaluateBinAlert({
        hasEverReported,
        isOnline,
        capacity: bin.currentCapacity ?? 0,
        binDiag: lastDiag,
      });

      // Only send telegram if alertLevel CHANGED
      if (nextAlertLevel === bin.alertLevel) continue;

      const time = toSGT();
      const location = bin.user?.location ?? "Unknown";
      const binName = bin.binMaterial.name;

      // Send alert messages
      if (nextAlertLevel === "hardware") {
        await sendTelegramAlert(`
🚨 *BIN HARDWARE FAILURE*
🗑 Bin: ${binName}
📍 Location: ${location}
⚙ Failed: ${failedComponents.join(", ")}
⏱ ${time}
        `);
      }

      if (nextAlertLevel === "offline") {
        await sendTelegramAlert(`
🚨 *BIN OFFLINE*
🗑 Bin: ${binName}
📍 Location: ${location}
❌ No heartbeat
⏱ ${time}
        `);
      }

      if (nextAlertLevel === "critical") {
        await sendTelegramAlert(`
⚠️ *BIN ALMOST FULL*
🗑 Bin: ${binName}
📍 Location: ${location}
📊 Capacity: ${bin.currentCapacity}%
⏱ ${time}
        `);
      }

      if (nextAlertLevel === "full") {
        await sendTelegramAlert(`
🚨 *BIN FULL*
🗑 Bin: ${binName}
📍 Location: ${location}
📊 Capacity: 100%
⏱ ${time}
        `);
      }

      // Recovery message when alert clears
      if (nextAlertLevel === null && bin.alertLevel !== null) {
        await sendTelegramAlert(`
✅ *BIN RECOVERED*
🗑 Bin: ${binName}
📍 Location: ${location}
✔ Status: Normal
⏱ ${time}
        `);
      }

      // Persist new alert state
      await prisma.bin.update({
        where: { id: bin.id },
        data: { alertLevel: nextAlertLevel },
      });

      console.log(
        `🔔 Bin ${bin.id} alertLevel changed: ${bin.alertLevel} → ${nextAlertLevel}`
      );
    }

    // ========================================
    // 2) SCANNERS: telegram alerts (optional but requested)
    // ========================================
    const scannerUsers = await prisma.user.findMany({
      where: { role: "BIN" }, // adjust if your scanner owners are different
      select: {
        id: true,
        location: true,
        scannerAlertActive: true, // NEW FIELD
      },
    });

    for (const u of scannerUsers) {
      const lastScannerDiag = await prisma.scannerDiagnosticLog.findFirst({
        where: { userId: u.id },
        orderBy: { timestamp: "desc" },
      });

      const hasScannerIssue =
        !!lastScannerDiag && lastScannerDiag.overallStatus === BinStatus.UNDER_MAINTENANCE;

      // Only notify on change
      if (hasScannerIssue === u.scannerAlertActive) continue;

      const time = toSGT();
      const loc = u.location ?? "Unknown";

      if (hasScannerIssue) {
        await sendTelegramAlert(`
🚨 *SCANNER ISSUE*
📍 Location: ${loc}
❌ Scanner malfunction detected
⏱ ${time}
        `);
      } else {
        await sendTelegramAlert(`
✅ *SCANNER RECOVERED*
📍 Location: ${loc}
✔ Scanner operational
⏱ ${time}
        `);
      }

      await prisma.user.update({
        where: { id: u.id },
        data: { scannerAlertActive: hasScannerIssue },
      });

      console.log(
        `🔔 Scanner alert changed for user ${u.id}: ${u.scannerAlertActive} → ${hasScannerIssue}`
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Alert sync complete (bins + scanners)",
    });
  } catch (err) {
    console.error("❌ Cron heartbeat-sync error:", err);
    return NextResponse.json(
      { ok: false, message: "Cron failed" },
      { status: 500 }
    );
  }
}
