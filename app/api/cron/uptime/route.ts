import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const HEARTBEAT_TIMEOUT = 10 * 60 * 1000; // 10 min
    const LOG_TTL = 60 * 60 * 24 * 7; // KEEP LOGS FOR 7 DAYS
    const now = new Date();

    // ------------------------------
    // ALIGN TO 5-MINUTE BUCKET (UTC)
    // ------------------------------
    const bucket = new Date(now);
    bucket.setSeconds(0);
    bucket.setMilliseconds(0);
    bucket.setMinutes(Math.floor(bucket.getMinutes() / 5) * 5);

    const bucketISO = bucket.toISOString(); // Safe key format

    // ------------------------------
    // GET ALL BINS
    // ------------------------------
    const bins = await prisma.bin.findMany({
      select: { id: true, lastHeartBeat: true },
    });

    // ------------------------------
    // WRITE UPTIME SNAPSHOT TO REDIS
    // WITH TTL TO AVOID KEY OVERLOAD
    // ------------------------------
    await Promise.all(
      bins.map((bin) => {
        const last = bin.lastHeartBeat
          ? new Date(bin.lastHeartBeat).getTime()
          : 0;

        const diff = now.getTime() - last;
        const status = diff <= HEARTBEAT_TIMEOUT ? 1 : 0;

        const redisKey = `uptime:${bin.id}:${bucketISO}`;

        return redis.set(redisKey, status, { ex: LOG_TTL });
      })
    );

    return NextResponse.json({
      success: true,
      timestamp: bucketISO,
      logged: bins.length,
    });
  } catch (err) {
    console.error("❌ Redis Cron Uptime Error:", err);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
