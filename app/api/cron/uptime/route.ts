import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const HEARTBEAT_TIMEOUT = 10 * 60 * 1000; // 10 minutes
    const LOG_TTL = 60 * 60 * 24 * 7; // Keep logs for 7 days
    const now = new Date();

    // ------------------------------
    // ALIGN TO 5-MINUTE BUCKET (UTC)
    // ------------------------------
    const bucket = new Date(now);
    bucket.setSeconds(0);
    bucket.setMilliseconds(0);
    bucket.setMinutes(Math.floor(bucket.getMinutes() / 5) * 5);

    const bucketISO = bucket.toISOString();

    // ------------------------------
    // GET ALL BINS
    // ------------------------------
    const bins = await prisma.bin.findMany({
      select: { id: true, lastHeartBeat: true },
    });

    // ------------------------------
    // WRITE UPTIME SNAPSHOT TO REDIS
    // (SKIP BINS WITH NO HEARTBEAT)
    // ------------------------------
    const writes = bins.map(bin => {
      // 🛑 Never reported → No Data (do not write)
      if (!bin.lastHeartBeat) return null;

      const last = new Date(bin.lastHeartBeat).getTime();
      const diff = now.getTime() - last;

      // Online if within timeout, else offline
      const status = diff <= HEARTBEAT_TIMEOUT ? 1 : 0;

      const redisKey = `uptime:${bin.id}:${bucketISO}`;

      return redis.set(redisKey, status, { ex: LOG_TTL });
    });

    await Promise.all(writes.filter(Boolean));

    return NextResponse.json({
      success: true,
      timestamp: bucketISO,
      binsProcessed: bins.length,
      binsLogged: writes.filter(Boolean).length,
    });
  } catch (err) {
    console.error("❌ Redis Cron Uptime Error:", err);
    return NextResponse.json(
      { error: "Cron failed" },
      { status: 500 }
    );
  }
}
