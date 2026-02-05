import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { editTelegramMessage } from "@/lib/telegram";
import { escapeMarkdownV2 } from "@/lib/telegram";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, adminName = "Admin Dashboard" } = await req.json();

    if (!["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const report = await prisma.faultReport.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // ⛔ No-op if status unchanged
    if (report.status === status) {
      return NextResponse.json({ success: true });
    }

    // --------------------
    // UPDATE DATABASE
    // --------------------
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

    // --------------------
    // TELEGRAM SYNC (BEST EFFORT)
    // --------------------
    if (report.telegramMessageId) {
      const baseInfo = escapeMarkdownV2(
        `🆔 Report ID: ${report.id}
📍 Location: ${report.location}
📂 Category: ${report.category}
🛠 Type: ${report.type}`
      );

      if (status === "IN_PROGRESS") {
        void editTelegramMessage(
          report.telegramMessageId,
          `🛠 *REPAIR IN PROGRESS*\n\n${baseInfo}\n\n👷 Taken by: ${escapeMarkdownV2(adminName)}`,
          [
            [
              {
                text: "✅ Resolved",
                callback_data: `fault:resolve:${report.id}`,
              },
              {
                text: "🗑 Delete",
                callback_data: `fault:delete:${report.id}`,
              },
            ],
          ]
        );
      }

      if (status === "RESOLVED") {
        void editTelegramMessage(
          report.telegramMessageId,
          `✅ *FAULT RESOLVED*\n\n${baseInfo}\n\n👷 Resolved by: ${escapeMarkdownV2(adminName)}`,
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