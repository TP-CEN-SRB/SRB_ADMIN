import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client";

export async function POST() {
  try {
    const TIMEOUT = 10 * 60 * 1000; // 10 minutes

    // Fetch all bins
    const bins = await prisma.bin.findMany({
      select: {
        id: true,
        lastHeartBeat: true,
        status: true,
        binMaterial: { select: { name: true } },
        userId: true,
      },
    });

    const now = Date.now();

    await Promise.all(
      bins.map(async (bin) => {
        // Determine online/offline from heartbeat
        const last = bin.lastHeartBeat
          ? new Date(bin.lastHeartBeat).getTime()
          : 0;
        const isOnline = last && now - last < TIMEOUT;

        let newStatus: BinStatus = isOnline
          ? BinStatus.FUNCTIONAL
          : BinStatus.UNDER_MAINTENANCE;

        // If online → also check diagnostics
        if (isOnline) {
          const lastDiag = await prisma.binDiagnosticLog.findFirst({
            where: { binId: bin.id },
            orderBy: { timestamp: "desc" },
          });

          if (lastDiag) {
            newStatus = lastDiag.overallStatus; // Functional OR Under Maintenance
          }
        }

        // Update only when status changed
        if (newStatus !== bin.status) {
          await prisma.bin.update({
            where: { id: bin.id },
            data: { status: newStatus },
          });

          console.log(
            `🔧 Updated Bin ${bin.id} (${bin.binMaterial.name}, user ${bin.userId}) → ${newStatus}`
          );
        }
      })
    );

    return NextResponse.json({
      ok: true,
      message: "Heartbeat + diagnostics sync complete",
    });
  } catch (err) {
    console.error("❌ Cron heartbeat-sync error:", err);
    return NextResponse.json(
      { ok: false, message: "Cron failed" },
      { status: 500 }
    );
  }
}
