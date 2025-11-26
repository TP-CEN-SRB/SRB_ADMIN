// app/api/cron/heartbeat-sync/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client";

export async function POST() {
  try {
    const TIMEOUT = 10 * 60 * 1000; // 10 mins

    const bins = await prisma.bin.findMany({
      select: {
        id: true,
        lastHeartBeat: true,
        status: true,
        binMaterial: { select: { name: true } },
        userId: true,
      },
    });

    const now = Date.now();

    await Promise.all(
      bins.map(async (bin) => {
        const last = bin.lastHeartBeat
          ? new Date(bin.lastHeartBeat).getTime()
          : 0;

        const isOnline = last && now - last < TIMEOUT;

        const newStatus = isOnline
          ? BinStatus.FUNCTIONAL
          : BinStatus.UNDER_MAINTENANCE;

        // 🔍 Only update if status changed — reduce DB writes
        if (newStatus !== bin.status) {
          await prisma.bin.update({
            where: { id: bin.id },
            data: { status: newStatus },
          });

          console.log(
            `🔄 Updated Bin ${bin.id} (${bin.binMaterial.name}, user ${bin.userId}) → ${newStatus}`
          );
        }
      })
    );

    return NextResponse.json({ ok: true, message: "Cron sync complete" });

  } catch (err) {
    console.error("❌ Cron heartbeat-sync error:", err);
    return NextResponse.json(
      { ok: false, message: "Cron failed" },
      { status: 500 }
    );
  }
}
