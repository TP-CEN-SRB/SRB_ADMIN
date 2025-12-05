import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const HEARTBEAT_TIMEOUT = 10 * 60 * 1000; // 10 min
    const now = new Date();

    // ------------------------------------------
    // ALIGN TO EXACT 5-MIN UTC BUCKET
    // ------------------------------------------
    const bucket = new Date(now);
    bucket.setSeconds(0);
    bucket.setMilliseconds(0);
    bucket.setMinutes(Math.floor(bucket.getMinutes() / 5) * 5);

    const bucketISO = bucket.toISOString(); // Always store in UTC

    // ------------------------------------------
    // FETCH ALL BINS
    // ------------------------------------------
    const bins = await prisma.bin.findMany({
      select: { id: true, lastHeartBeat: true },
    });

    // ------------------------------------------
    // WRITE SNAPSHOTS TO REDIS (NO PIPELINE)
    // ------------------------------------------
    await Promise.all(
      bins.map((bin) => {
        const last = bin.lastHeartBeat
          ? new Date(bin.lastHeartBeat).getTime()
          : 0;

        const diff = now.getTime() - last;
        const status = diff <= HEARTBEAT_TIMEOUT ? 1 : 0; // 1 = online, 0 = offline

        const redisKey = `uptime:${bin.id}:${bucketISO}`;

        return redis.set(redisKey, status);
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
