import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client";
import { sendTelegramAlert } from "@/lib/telegram";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function POST() {
  try {
    const TIMEOUT = 10 * 60 * 1000; // 10 minutes
    const now = Date.now();

    // ----------------------------------------
    // FETCH ALL BINS
    // ----------------------------------------
    const bins = await prisma.bin.findMany({
      select: {
        id: true,
        lastHeartBeat: true,
        status: true,
        binMaterial: { select: { name: true } },
        user: {
          select: {
            location: true,
          },
        },
      },
    });


    await Promise.all(
      bins.map(async (bin) => {
        // ----------------------------------------
        // HEARTBEAT → ONLINE / OFFLINE
        // ----------------------------------------
        const last = bin.lastHeartBeat
          ? new Date(bin.lastHeartBeat).getTime()
          : 0;

        const isOnline = last && now - last < TIMEOUT;

        let newStatus: BinStatus = isOnline
          ? BinStatus.FUNCTIONAL
          : BinStatus.UNDER_MAINTENANCE;

        // ----------------------------------------
        // IF ONLINE → CHECK HARDWARE DIAGNOSTICS
        // ----------------------------------------
        if (isOnline) {
          const lastDiag = await prisma.binDiagnosticLog.findFirst({
            where: { binId: bin.id },
            orderBy: { timestamp: "desc" },
          });

          if (lastDiag) {
            newStatus = lastDiag.overallStatus;
          }
        }

        // ----------------------------------------
        // STATUS CHANGE → UPDATE + TELEGRAM ALERT
        // ----------------------------------------
        if (newStatus !== bin.status) {
          // 1️⃣ Update DB
          await prisma.bin.update({
            where: { id: bin.id },
            data: { status: newStatus },
          });

          // 2️⃣ Build Telegram message
          const time = new Date().toLocaleString("en-SG");
          let message: string | null = null;

          if (newStatus === BinStatus.UNDER_MAINTENANCE) {
            message = `
🚨 *BIN DOWN*
🗑 Bin: ${bin.binMaterial.name}
📍 Location: ${bin.user?.location ?? "Unknown"}
❌ Status: UNDER MAINTENANCE
⏱ ${time}
`;
          }

          if (newStatus === BinStatus.FUNCTIONAL) {
            message = `
✅ *BIN RECOVERED*
🗑 Bin: ${bin.binMaterial.name}
📍 Location: ${bin.user?.location ?? "Unknown"}
✔ Status: FUNCTIONAL
⏱ ${time}
`;
          }

          // 3️⃣ Send Telegram (safe, once per transition)
          if (message) {
            await sendTelegramAlert(message);
          }

          console.log(
            `🔔 Bin ${bin.id} status changed: ${bin.status} → ${newStatus}`
          );
        }
      })
    );

    return NextResponse.json({
      ok: true,
      message: "Heartbeat + diagnostics sync complete",
    });
  } catch (err) {
    console.error("❌ Cron heartbeat-sync error:", err);
    return NextResponse.json(
      { ok: false, message: "Cron failed" },
      { status: 500 }
    );
  }
}
