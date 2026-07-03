import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/db";

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


const alignTo5Min = (d: Date) => {
  const t = new Date(d);
  t.setSeconds(0, 0);
  t.setMinutes(Math.floor(t.getMinutes() / 5) * 5);
  return t;
};


const uiLabel = (range: string, ts: Date) => {
  const sgt = new Date(
    ts.toLocaleString("en-US", { timeZone: "Asia/Singapore" })
  );

  if (range === "hour")
    return `${sgt.getHours().toString().padStart(2, "0")}:${sgt
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  if (range === "day") return `${sgt.getHours()}:00`;
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

const bucketMonth = (d: Date) => {
  const ts = new Date(d);
  ts.setDate(1);
  ts.setHours(0, 0, 0, 0);
  return ts;
};

// ---------------------
// BUCKET GENERATOR
// ---------------------
const generateBuckets = (range: string, since: Date, now: Date) => {
  const buckets: Date[] = [];
  const cursor = new Date(since);

  while (cursor <= now) {
    let ts: Date;

    if (range === "hour") {
      ts = bucket5(cursor);
      cursor.setMinutes(cursor.getMinutes() + 5);
    } else if (range === "day") {
      ts = bucketHour(cursor);
      cursor.setHours(cursor.getHours() + 1);
    } else if (range === "month") {
      ts = bucketDay(cursor);
      cursor.setDate(cursor.getDate() + 1);
    } else {
      ts = bucketMonth(cursor);
      cursor.setMonth(cursor.getMonth() + 1);
    }

    buckets.push(new Date(ts));
  }

  return Array.from(
    new Map(buckets.map(b => [b.toISOString(), b])).values()
  );
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
      return NextResponse.json(
        { error: "Missing managerId" },
        { status: 400 }
      );
    }

    // Align to last completed bucket
    const end = alignTo5Min(new Date());
    const since = new Date(end);

    if (range === "hour") {
      since.setTime(end.getTime() - 60 * 60 * 1000);
    } else if (range === "day") {
      since.setTime(end.getTime() - 24 * 60 * 60 * 1000);
    } else if (range === "month") {
      since.setDate(end.getDate() - 30);
    } else {
      since.setFullYear(end.getFullYear() - 1);
    }


    const bins = await prisma.bin.findMany({
      where: { userId: managerId },
      select: {
        id: true,
        binMaterial: { select: { name: true } },
      },
    });

    const allBuckets = generateBuckets(range, since, end);

    const results = await Promise.all(
      bins.map(async bin => {
        const pattern = `uptime:${bin.id}:*`;
        let cursor = "0";
        const keys: string[] = [];

        do {
          const [next, batch] = await redis.scan(cursor, {
            match: pattern,
            count: 200,
          });
          cursor = next;
          keys.push(...batch);
        } while (cursor !== "0");

        const values = keys.length ? await redis.mget(...keys) : [];

        const logs: { ts: Date; value: number }[] = [];

        for (let i = 0; i < keys.length; i++) {
          if (values[i] == null) continue;

          // uptime:<binId>:<ISO timestamp...>
          const tsString = keys[i].split(":").slice(2).join(":");
          const ts = new Date(tsString);

          if (!Number.isNaN(ts.getTime()) && ts >= since) {
            logs.push({ ts, value: Number(values[i]) });
          }
        }

        const bucketMap: Record<string, number[]> = {};
        allBuckets.forEach(b => (bucketMap[b.toISOString()] = []));

        for (const log of logs) {
          let ts;
          if (range === "hour") ts = bucket5(log.ts);
          else if (range === "day") ts = bucketHour(log.ts);
          else if (range === "month") ts = bucketDay(log.ts);
          else ts = bucketMonth(log.ts);

          const key = ts.toISOString();
          if (bucketMap[key]) {
            bucketMap[key].push(log.value);
          }
        }

        const uptimeTimeline = allBuckets.map(b => {
          const vals = bucketMap[b.toISOString()];
          const uptime =
            vals.length === 0
              ? null
              : Math.round(
                  (vals.reduce((a, v) => a + v, 0) / vals.length) * 100
                );

          return {
            timestampUTC: b.toISOString(),
            timestampSGT: toSGT(b),
            label: uiLabel(range, b),
            uptime,
          };
        });

        const total = logs.length;
        const online = logs.filter(l => l.value === 1).length;

        return {
          id: bin.id,
          name: bin.binMaterial.name,
          uptimePercent:
            total === 0 ? null : Math.round((online / total) * 100),
          uptimeTimeline,
        };
      })
    );

    return NextResponse.json(results);
  } catch (err) {
    console.error("❌ Redis Uptime API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch uptime" },
      { status: 500 }
    );
  }
}