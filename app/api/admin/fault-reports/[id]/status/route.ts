import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { editTelegramMessage } from "@/lib/telegram";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();

    if (!["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const report = await prisma.faultReport.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (report.status === status) {
      return NextResponse.json({ success: true });
    }

    const adminName = "Admin Dashboard";

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

    // ✅ Update DB
    await prisma.faultReport.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === "IN_PROGRESS" && {
          takenByAdminName: adminName,
        }),
        ...(status === "RESOLVED" && {
          resolvedByAdminName: adminName,
        }),
      },
    });

    // ✅ Sync Telegram
    if (report.telegramMessageId) {
      const telegramMessageId = Number(report.telegramMessageId);

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

👷 Taken by: ${adminName}`,
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

👷 Resolved by: ${adminName}`,
          []
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Update fault status error:", err);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}