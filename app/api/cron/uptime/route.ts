import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client";
import { redis } from "@/lib/redis"; // ← NEW

export const dynamic = "force-dynamic";
export const revalidate = 0;


export async function GET() {
  try {
    const HEARTBEAT_TIMEOUT = 10 * 60 * 1000; // 10 minutes
    const now = new Date();

    // ------------------------------------------
    // ALIGN TO EXACT 5-MIN UTC BUCKET
    // ------------------------------------------
    const bucket = new Date(now);
    bucket.setSeconds(0);
    bucket.setMilliseconds(0);
    bucket.setMinutes(Math.floor(bucket.getMinutes() / 5) * 5);

    const bucketISO = bucket.toISOString(); // Store in UTC always

    // ------------------------------------------
    // FETCH ALL BINS (same as before)
    // ------------------------------------------
    const bins = await prisma.bin.findMany({
      select: { id: true, lastHeartBeat: true },
    });

    // ------------------------------------------
    // BUILD REDIS PAYLOAD
    // ------------------------------------------
    const pipeline = redis.pipeline();

    bins.forEach((bin) => {
      const last = bin.lastHeartBeat
        ? new Date(bin.lastHeartBeat).getTime()
        : 0;

      const diff = now.getTime() - last;

      const status =
        diff <= HEARTBEAT_TIMEOUT
          ? 1 // online
          : 0; // offline

      // Each snapshot stored as:
      // uptime:<binId>:<ISO timestamp> = 1 or 0
      const redisKey = `uptime:${bin.id}:${bucketISO}`;

      pipeline.set(redisKey, status);
    });

    await pipeline.exec();

    return NextResponse.json({
      success: true,
      timestamp: bucketISO,
      logged: bins.length,
    });

  } catch (err) {
    console.error("❌ Redis Cron Uptime Error:", err);
    return NextResponse.json(
      { error: "Cron failed" },
      { status: 500 }
    );
  }
}
