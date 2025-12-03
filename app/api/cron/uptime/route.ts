import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client";

export async function GET() {
  try {
    const HEARTBEAT_TIMEOUT = 10 * 60 * 1000;
    const now = new Date();

    // Align timestamp to nearest 5-min bucket (SAME AS LOCAL LOGGER)
    const bucket = new Date(now);
    bucket.setSeconds(0);
    bucket.setMilliseconds(0);
    bucket.setMinutes(Math.floor(bucket.getMinutes() / 5) * 5);

    // Fetch bins
    const bins = await prisma.bin.findMany({
      select: { id: true, lastHeartBeat: true },
    });

    // Create logs
    const logs = bins.map((bin) => {
      const last = bin.lastHeartBeat
        ? new Date(bin.lastHeartBeat).getTime()
        : 0;

      const diff = now.getTime() - last;

      const status =
        diff <= HEARTBEAT_TIMEOUT
          ? BinStatus.FUNCTIONAL
          : BinStatus.UNDER_MAINTENANCE;

      return {
        binId: bin.id,
        timestamp: bucket,
        status,
      };
    });

    // Remove duplicates + insert fresh bucket
    await prisma.$transaction([
      prisma.binUptimeLog.deleteMany({ where: { timestamp: bucket } }),
      prisma.binUptimeLog.createMany({ data: logs }),
    ]);

    return NextResponse.json({
      success: true,
      timestamp: bucket,
      logged: bins.length,
    });
  } catch (err) {
    console.error("❌ Cron Uptime error:", err);
    return NextResponse.json(
      { error: "Cron failed" },
      { status: 500 }
    );
  }
}
