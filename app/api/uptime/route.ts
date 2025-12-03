import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client";

// ---------------------
// BUCKET FORMATTERS
// ---------------------
const bucket5 = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:${Math.floor(
    d.getMinutes() / 5
  ) * 5}`;

const bucketHour = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()} ${d.getHours()}:00`;

const bucketDay = (d: Date) =>
  `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const managerId = searchParams.get("managerId");
    const range = searchParams.get("range") || "hour";

    if (!managerId)
      return NextResponse.json({ error: "Missing managerId" }, { status: 400 });

    // ---------------------
    // TIME RANGE SELECTOR
    //----------------------
    const now = new Date();
    const since = new Date(now);

    if (range === "hour") since.setHours(now.getHours() - 1);
    else if (range === "day") since.setDate(now.getDate() - 1);
    else if (range === "month") since.setDate(now.getDate() - 30);
    else if (range === "year") since.setFullYear(now.getFullYear() - 1);

    // ---------------------
    // GET BINS FOR MANAGER
    // ---------------------
    const bins = await prisma.bin.findMany({
      where: { userId: managerId },
      select: { id: true, binMaterial: { select: { name: true } } },
    });

    // ---------------------
    // PROCESS EACH BIN
    // ---------------------
    const results = await Promise.all(
      bins.map(async (bin) => {
        // Fetch raw uptime logs
        const logs = await prisma.binUptimeLog.findMany({
          where: { binId: bin.id, timestamp: { gte: since } },
          orderBy: { timestamp: "asc" },
        });

        if (logs.length === 0) {
          return {
            id: bin.id,
            name: bin.binMaterial.name,
            uptimePercent: 0,
            uptimeTimeline: [],
          };
        }

        // ----------------------------------------------------
        // BUCKETING RULES BASED ON RANGE
        // ----------------------------------------------------
        const buckets: Record<string, number[]> = {};

        logs.forEach((log) => {
          const ts = new Date(log.timestamp);

          let bucketKey = "";
          if (range === "hour" || range === "day") bucketKey = bucket5(ts); // 5-min buckets
          else if (range === "month") bucketKey = bucketHour(ts); // 1-hour bucket
          else bucketKey = bucketDay(ts); // 1-day bucket

          if (!buckets[bucketKey]) buckets[bucketKey] = [];
          buckets[bucketKey].push(log.status === BinStatus.FUNCTIONAL ? 1 : 0);
        });

        // Convert raw buckets → uptime %
        const timeline = Object.entries(buckets).map(([timestamp, arr]) => {
          const sum = arr.reduce<number>((a, b) => a + b, 0); // FIXED HERE
          return {
            timestamp,
            uptime: Math.round((sum / arr.length) * 100),
          };
        });

        // Compute total uptime %
        const total = logs.length;
        const online = logs.filter((l) => l.status === BinStatus.FUNCTIONAL).length;
        const uptimePercent = Math.round((online / total) * 100);

        return {
          id: bin.id,
          name: bin.binMaterial.name,
          uptimePercent,
          uptimeTimeline: timeline,
        };
      })
    );

    return NextResponse.json(results);
  } catch (error) {
    console.error("❌ Uptime API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch uptime timeline" },
      { status: 500 }
    );
  }
}
