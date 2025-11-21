// lib/autoUptimeLogger.ts
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client"; // ✅ import the enum

export const initAutoUptimeLogger = () => {
  const logInterval = 60_000; // every 1 min

  setInterval(async () => {
    const bins = await prisma.bin.findMany({
      select: { id: true, lastHeartBeat: true },
    });

    const now = new Date();
    const logs = bins.map((b) => ({
      binId: b.id,
      timestamp: now,
      status:
        !b.lastHeartBeat || now.getTime() - b.lastHeartBeat.getTime() > 10 * 60 * 1000
          ? BinStatus.UNDER_MAINTENANCE
          : BinStatus.FUNCTIONAL, 
    }));

    await prisma.binUptimeLog.createMany({ data: logs }); // ✅ no type error now
    console.log(`🕒 Uptime snapshot logged for ${bins.length} bins`);
  }, logInterval);
};
