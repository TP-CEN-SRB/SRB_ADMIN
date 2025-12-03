// lib/autoUptimeLogger.ts
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client";

export const initAutoUptimeLogger = () => {
  const FIVE_MINUTES = 5 * 60 * 1000;   // 300,000ms
  const HEARTBEAT_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  // Prevent running on Vercel serverless (to avoid double logging)
  if (process.env.VERCEL) {
    console.log("⏭️ autoUptimeLogger disabled on Vercel runtime");
    return;
  }

  console.log("🟢 autoUptimeLogger started (5-minute intervals)");

  setInterval(async () => {
    try {
      const now = new Date();

      // ALIGN TIMESTAMP TO EXACT 5-MIN BUCKET (CRITICAL FIX)
      const bucket = new Date(now);
      bucket.setSeconds(0);
      bucket.setMilliseconds(0);
      bucket.setMinutes(Math.floor(bucket.getMinutes() / 5) * 5);

      // Get bins
      const bins = await prisma.bin.findMany({
        select: { id: true, lastHeartBeat: true },
      });

      // Prepare logs (1 per bin)
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
          timestamp: new Date(bucket.toISOString()),
          status,
        };
      });

      // PREVENT DUPLICATE BUCKETS (CRITICAL FIX)
      await prisma.$transaction([
        prisma.binUptimeLog.deleteMany({
          where: { timestamp: bucket },
        }),
        prisma.binUptimeLog.createMany({ data: logs }),
      ]);

      console.log(`🟢 Logged uptime snapshot @ ${bucket.toISOString()} (${bins.length} bins)`);

    } catch (error) {
      console.error("❌ autoUptimeLogger error:", error);
    }
  }, FIVE_MINUTES);
};
