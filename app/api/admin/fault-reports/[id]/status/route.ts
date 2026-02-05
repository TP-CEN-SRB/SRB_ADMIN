import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { editTelegramMessage } from "@/lib/telegram";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("---- PATCH /status called ----", params.id);

    const { status } = await req.json();

    if (!["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // 1️⃣ Ensure report exists
    const existing = await prisma.faultReport.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (existing.status === status) {
      return NextResponse.json({ success: true });
    }

    // 2️⃣ Update DB FIRST (source of truth)
    await prisma.faultReport.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === "IN_PROGRESS" && {
          takenByAdminName: "Admin Dashboard",
        }),
        ...(status === "RESOLVED" && {
          resolvedByAdminName: "Admin Dashboard",
        }),
      },
    });

    // 3️⃣ Fetch fresh data (THIS IS THE FIX)
    const report = await prisma.faultReport.findUnique({
      where: { id: params.id },
    });

    if (!report || !report.telegramMessageId) {
      console.log("ℹ️ No Telegram message to sync");
      return NextResponse.json({ success: true });
    }

    const timeSGT =
      new Date().toLocaleString("en-SG", {
        timeZone: "Asia/Singapore",
        hour12: false,
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }) + " SGT";

    const telegramMessageId = Number(report.telegramMessageId);

    // 4️⃣ Sync Telegram (best effort)
    if (status === "IN_PROGRESS") {
      void editTelegramMessage(
        telegramMessageId,
`🛠 REPAIR IN PROGRESS
🆔 Report ID: ${report.id}

📍 Location: ${report.location}
📂 Category: ${report.category}
🛠 Type: ${report.type}
🕒 ${timeSGT}

📝 Description: ${report.description ?? "No description"}

👷 Taken by: Admin Dashboard`,
        [
          [
            { text: "✅ Resolved", callback_data: `fault:resolve:${report.id}` },
            { text: "🗑 Delete", callback_data: `fault:delete:${report.id}` },
          ],
        ]
      );
    }

    if (status === "RESOLVED") {
      void editTelegramMessage(
        telegramMessageId,
`✅ FAULT RESOLVED
🆔 Report ID: ${report.id}

📍 Location: ${report.location}
📂 Category: ${report.category}
🛠 Type: ${report.type}
🕒 ${timeSGT}
📝 Description: ${report.description ?? "No description"}

👷 Resolved by: Admin Dashboard`,
        []
      );
    }

    console.log("✅ Telegram synced");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ PATCH status error:", err);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}