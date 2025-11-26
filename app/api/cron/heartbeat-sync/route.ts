import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client";

export async function GET() {
  try {
    const bins = await prisma.bin.findMany({
      select: {
        id: true,
        status: true,
        lastHeartBeat: true,
      },
    });

    const now = Date.now();

    await Promise.all(
      bins.map(async (bin) => {
        const lastHB = bin.lastHeartBeat
          ? new Date(bin.lastHeartBeat).getTime()
          : 0;

        const isOnline = lastHB && now - lastHB < 10 * 60 * 1000; // 10 min

        let effectiveStatus: "FUNCTIONAL" | "UNDER_MAINTENANCE" =
          bin.status === "FUNCTIONAL" ? "FUNCTIONAL" : "UNDER_MAINTENANCE";

        if (bin.status === "FUNCTIONAL" && !isOnline) {
          effectiveStatus = "UNDER_MAINTENANCE";
        }
        if (bin.status === "UNDER_MAINTENANCE" && isOnline) {
          effectiveStatus = "FUNCTIONAL";
        }

        if (effectiveStatus !== bin.status) {
          await prisma.bin.update({
            where: { id: bin.id },
            data: { status: effectiveStatus },
          });
        }
      })
    );

    return NextResponse.json({ ok: true, message: "Bin status synced" });
  } catch (err) {
    console.error("Cron heartbeat-sync error:", err);
    return NextResponse.json(
      { ok: false, error: "Cron heartbeat sync failed" },
      { status: 500 }
    );
  }
}
