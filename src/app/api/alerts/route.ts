import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSmartAlerts } from "@/app/action/bin";
import { BinStatus } from "@/generated/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ------------------------------------------------------
    // 1) BIN ALERTS
    // ------------------------------------------------------
    const binAlerts = await getSmartAlerts();

    // ------------------------------------------------------
    // 2) SCANNER ALERTS (latest-per-scanner, only if FAILED + recent)
    // ------------------------------------------------------
    const SCANNER_TIMEOUT = 10 * 60 * 1000; // 10 minutes
    const now = Date.now();

    // Group: latest timestamp per scanner userId
    const grouped = await prisma.scannerDiagnosticLog.groupBy({
      by: ["userId"],
      _max: { timestamp: true },
    });

    // ✅ strict Date[] (remove nulls)
    const latestDates: Date[] = grouped
      .map((g) => g._max.timestamp)
      .filter((t)=> t !== null);

    // No logs at all
    if (latestDates.length === 0) {
      return NextResponse.json(binAlerts, {
        headers: { "Cache-Control": "no-store, must-revalidate" },
      });
    }

    // Fetch those latest rows
    const latestScannerLogs = await prisma.scannerDiagnosticLog.findMany({
      where: { timestamp: { in: latestDates } },
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        userId: true,
        timestamp: true,
        scannerOK: true,
        overallStatus: true,
        details: true,
      },
    });

    // Fetch user info for those scanner userIds (relation exists, but avoids TS "user not exist")
    const userIds = Array.from(new Set(latestScannerLogs.map((l) => l.userId)));

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, location: true, lat: true, long: true },
    });

    const userById = new Map(users.map((u) => [u.id, u]));

    const scannerAlerts = latestScannerLogs
      .filter((diag) => {
        const age = now - diag.timestamp.getTime();
        const isRecent = age < SCANNER_TIMEOUT;

        // Only show if failed AND recent
        return diag.overallStatus === BinStatus.UNDER_MAINTENANCE && isRecent;
      })
      .map((diag) => {
        const u = userById.get(diag.userId);

        const det = (diag.details ?? {}) as any;

        const failedComponents = Array.isArray(det.failedComponents)
          ? det.failedComponents
          : [];

        const allComponents = Array.isArray(det.allComponents)
          ? det.allComponents
          : [];

        return {
          id: `scanner-${diag.userId}`,
          type: "scanner",

          location: u?.location ?? "Unknown Scanner",
          material: "Scanner Unit",
          capacity: null,

          lastHeartBeat: diag.timestamp,
          lastDiagnosticAt: diag.timestamp,

          lat: u?.lat != null ? Number(u.lat) : null,
          long: u?.long != null ? Number(u.long) : null,

          alertLevel: "hardware",
          hardwareFailed: true,

          failedComponents,
          components: allComponents,

          isScanner: true,
        };
      });

    // ------------------------------------------------------
    // 3) MERGE + DEDUP
    // ------------------------------------------------------
    const combined = [...binAlerts, ...scannerAlerts];
    const unique = Array.from(new Map(combined.map((a) => [a.id, a])).values());

    return NextResponse.json(unique, {
      headers: { "Cache-Control": "no-store, must-revalidate" },
    });
  } catch (error) {
    console.error("❌ Failed to fetch alerts API:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
