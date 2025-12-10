import { NextResponse } from "next/server";
import { getSmartAlerts } from "@/app/action/bin";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // ------------------------------------------------------
    // 1) BIN ALERTS (existing)
    // ------------------------------------------------------
    const binAlerts = await getSmartAlerts();

    // ------------------------------------------------------
    // 2) SCANNER ALERTS
    // ------------------------------------------------------
    const scannerDiagnostics = await prisma.scannerDiagnosticLog.findMany({
      orderBy: { timestamp: "desc" },
      include: {
        user: {
          select: {
            id: true,
            location: true,
            lat: true,
            long: true,
          },
        },
      },
    });

    const scannerAlerts = scannerDiagnostics
      .filter((d) => d.overallStatus === "UNDER_MAINTENANCE")
      .map((diag) => {
        const det = (diag.details ?? {}) as any;

        const failedComponents = Array.isArray(det.failedComponents)
          ? det.failedComponents
          : [];

        const allComponents = Array.isArray(det.allComponents)
          ? det.allComponents
          : [];

        return {
          id: `scanner-${diag.userId}`,
          type: "scanner", // ⭐ REQUIRED FOR FRONTEND
          
          location: diag.user?.location ?? "Unknown Scanner",
          material: "Scanner Unit",
          capacity: null,

          lastHeartBeat: diag.timestamp, // Scanner's last diagnostic timestamp
          lastDiagnosticAt: diag.timestamp,

          lat: diag.user?.lat ? Number(diag.user.lat) : null,
          long: diag.user?.long ? Number(diag.user.long) : null,

          alertLevel: "hardware",
          hardwareFailed: true,

          failedComponents,
          components: allComponents,

          isScanner: true,
        };
      });

    // ------------------------------------------------------
    // 3) MERGE + DEDUPLICATE
    // ------------------------------------------------------
    const combined = [...binAlerts, ...scannerAlerts];
    const unique = Array.from(new Map(combined.map((a) => [a.id, a])).values());

    return NextResponse.json(unique, {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    });

  } catch (error) {
    console.error("❌ Failed to fetch alerts API:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}
