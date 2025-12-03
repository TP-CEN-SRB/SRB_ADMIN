import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client";

// ---------------------
// FORMATTERS
// ---------------------
const toSGT = (ts: Date) =>
  new Date(ts).toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

// Label formatter (cleaner for UI)
const labelForRange = (range: string, ts: Date) => {
  const sgt = new Date(
    ts.toLocaleString("en-US", { timeZone: "Asia/Singapore" })
  );

  if (range === "hour" || range === "day") {
    return `${sgt.getHours().toString().padStart(2, "0")}:${sgt
      .getMinutes()
      .toString()
      .padStart(2, "0")}`; // 13:05
  }

  if (range === "month") {
    return `${sgt.getDate()}`; // 1–31
  }

  if (range === "year") {
    return `${sgt.getMonth() + 1}`; // 1–12
  }

  return "";
};

const bucket5 = (d: Date) => {
  const ts = new Date(d);
  ts.setSeconds(0);
  ts.setMilliseconds(0);
  ts.setMinutes(Math.floor(ts.getMinutes() / 5) * 5);
  return ts;
};

const bucketHour = (d: Date) => {
  const ts = new Date(d);
  ts.setMinutes(0, 0, 0);
  return ts;
};

const bucketDay = (d: Date) => {
  const ts = new Date(d);
  ts.setHours(0, 0, 0, 0);
  return ts;
};

// ---------------------
// MAIN HANDLER
// ---------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");
    const range = searchParams.get("range") || "hour";

    if (!managerId)
      return NextResponse.json({ error: "Missing managerId" }, { status: 400 });

    // Time window
    const now = new Date();
    const since = new Date(now);

    if (range === "hour") since.setHours(now.getHours() - 1);
    else if (range === "day") since.setDate(now.getDate() - 1);
    else if (range === "month") since.setDate(now.getDate() - 30);
    else if (range === "year") since.setFullYear(now.getFullYear() - 1);

    const bins = await prisma.bin.findMany({
      where: { userId: managerId },
      select: { id: true, binMaterial: { select: { name: true } } },
    });

    // ---------------------
    // PROCESS EACH BIN
    // ---------------------
    const results = await Promise.all(
      bins.map(async (bin) => {
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

        // Bucket maps: key = bucket timestamp string
        const buckets: Record<string, { ts: Date; values: number[] }> = {};

        logs.forEach((log) => {
          const ts = new Date(log.timestamp);

          let bucketTS: Date;
          if (range === "hour" || range === "day") bucketTS = bucket5(ts);
          else if (range === "month") bucketTS = bucketHour(ts);
          else bucketTS = bucketDay(ts);

          const key = bucketTS.toISOString();

          if (!buckets[key]) buckets[key] = { ts: bucketTS, values: [] };

          buckets[key].values.push(
            log.status === BinStatus.FUNCTIONAL ? 1 : 0
          );
        });

        const timeline = Object.values(buckets).map((b) => {
          const sum = b.values.reduce((a, c) => a + c, 0);
          return {
            timestampUTC: b.ts.toISOString(),
            timestampSGT: toSGT(b.ts),
            label: labelForRange(range, b.ts),
            uptime: Math.round((sum / b.values.length) * 100),
          };
        });

        const total = logs.length;
        const online = logs.filter(
          (l) => l.status === BinStatus.FUNCTIONAL
        ).length;
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
