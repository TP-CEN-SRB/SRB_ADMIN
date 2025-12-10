import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import prisma from "@/lib/db"; // only used to get bin list

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// ---------------------
// FORMATTERS
// ---------------------
const toSGT = (ts: Date) =>
  ts.toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const uiLabel = (range: string, ts: Date) => {
  const sgt = new Date(ts.toLocaleString("en-US", { timeZone: "Asia/Singapore" }));

  if (range === "hour" || range === "day") {
    return `${sgt.getHours().toString().padStart(2, "0")}:${sgt
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
  if (range === "month") return `${sgt.getDate()}`;
  if (range === "year") return `${sgt.getMonth() + 1}`;

  return "";
};

// ---------------------
// BUCKET HELPERS
// ---------------------
const bucket5 = (d: Date) => {
  const ts = new Date(d);
  ts.setSeconds(0, 0);
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

    if (!managerId) {
      return NextResponse.json({ error: "Missing managerId" }, { status: 400 });
    }

    // TIME WINDOW
    const now = new Date();
    const since = new Date(now);

    if (range === "hour") since.setHours(now.getHours() - 1);
    else if (range === "day") since.setDate(now.getDate() - 1);
    else if (range === "month") since.setDate(now.getDate() - 30);
    else if (range === "year") since.setFullYear(now.getFullYear() - 1);

    // Fetch bins
    const bins = await prisma.bin.findMany({
      where: { userId: managerId },
      select: { id: true, binMaterial: { select: { name: true } } },
    });

    // Main bin processing
    const results = await Promise.all(
      bins.map(async (bin) => {
        const pattern = `uptime:${bin.id}:*`;

        // 1️⃣ SAFE SCAN — replaces KEYS
        let cursor: string = "0";
        let keys: string[] = [];

        do {
          const [newCursor, batch] = await redis.scan(cursor, {
            match: pattern,
            count: 200,
          });

          cursor = newCursor;
          keys.push(...batch);
        } while (cursor !== "0");

        if (keys.length === 0) {
          return {
            id: bin.id,
            name: bin.binMaterial.name,
            uptimePercent: 0,
            uptimeTimeline: [],
          };
        }

        // 2️⃣ Fetch values
        const values = await redis.mget(...keys);

        // 3️⃣ Combine keys + values → logs[]
        const logs: { ts: Date; value: number }[] = [];

        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = values[i];

          if (value == null) continue;

          // Extract timestamp from key
          const [_p, _id, ...rest] = key.split(":");
          const tsISO = rest.join(":");
          const ts = new Date(tsISO);

          if (ts >= since) logs.push({ ts, value: Number(value) });
        }

        if (!logs.length) {
          return {
            id: bin.id,
            name: bin.binMaterial.name,
            uptimePercent: 0,
            uptimeTimeline: [],
          };
        }

        // 4️⃣ BUCKETING
        const bucketMap: Record<string, { ts: Date; values: number[] }> = {};

        for (const log of logs) {
          let bucketTS;

          if (range === "hour" || range === "day") bucketTS = bucket5(log.ts);
          else if (range === "month") bucketTS = bucketHour(log.ts);
          else bucketTS = bucketDay(log.ts);

          const key = bucketTS.toISOString();

          if (!bucketMap[key]) bucketMap[key] = { ts: bucketTS, values: [] };
          bucketMap[key].values.push(log.value);
        }

        const uptimeTimeline = Object.values(bucketMap).map((b) => {
          const avg =
            Math.round(
              (b.values.reduce((a, v) => a + v, 0) / b.values.length) * 100
            );

          return {
            timestampUTC: b.ts.toISOString(),
            timestampSGT: toSGT(b.ts),
            label: uiLabel(range, b.ts),
            uptime: avg,
          };
        });

        // 5️⃣ Overall uptime %
        const total = logs.length;
        const online = logs.filter((l) => l.value === 1).length;
        const uptimePercent = Math.round((online / total) * 100);

        return {
          id: bin.id,
          name: bin.binMaterial.name,
          uptimePercent,
          uptimeTimeline,
        };
      })
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error("❌ Redis Uptime API error:", err);
    return NextResponse.json({ error: "Failed to fetch uptime" }, { status: 500 });
  }
}

