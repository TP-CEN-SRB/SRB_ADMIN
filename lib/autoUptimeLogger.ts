import prisma from "@/lib/db";

// Run this periodically (every 5 min)
export const startAutoUptimeLogger = () => {
  const logInterval = 5 * 60 * 1000; // 5 min

  setInterval(async () => {
    const now = new Date();
    const cutoff = new Date(Date.now() - 10 * 60 * 1000); // 10 min threshold

    const bins = await prisma.bin.findMany({
      select: { id: true, lastHeartBeat: true }
    });

    const logs = bins.map((b) => ({
      binId: b.id,
      timestamp: now,
      status:
        !b.lastHeartBeat || b.lastHeartBeat < cutoff
          ? "UNDER_MAINTENANCE"
          : "FUNCTIONAL",
    }));

    await prisma.binUptimeLog.createMany({ data: logs });
    console.log(`🕒 Uptime snapshot logged for ${bins.length} bins`);
  }, logInterval);
};
