import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  editTelegramMessage,
  deleteTelegramMessage,
} from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const callback = body.callback_query;
  if (!callback) return NextResponse.json({ ok: true });

  const messageId = callback.message.message_id;
  const data = callback.data; // fault:take:<id>

  const [_, action, faultId] = data.split(":");

  const report = await prisma.faultReport.findUnique({
    where: { id: faultId },
  });

  if (!report) {
    await deleteTelegramMessage(messageId);
    return NextResponse.json({ ok: true });
  }

  // --------------------
  // ACTION HANDLING
  // --------------------

  if (action === "take" && report.status === "OPEN") {
    await prisma.faultReport.update({
      where: { id: faultId },
      data: { status: "IN_PROGRESS" },
    });

    await editTelegramMessage(
      messageId,
      `🛠 *REPAIR IN PROGRESS*\n📍 ${report.location}\n📂 ${report.category}`,
      [
        [
          { text: "✅ Resolved", callback_data: `fault:resolve:${faultId}` },
          { text: "🗑 Delete", callback_data: `fault:delete:${faultId}` },
        ],
      ]
    );
  }

  if (action === "resolve" && report.status === "IN_PROGRESS") {
    await prisma.faultReport.update({
      where: { id: faultId },
      data: { status: "RESOLVED" },
    });

    await editTelegramMessage(
      messageId,
      `✅ *FAULT RESOLVED*\n📍 ${report.location}\n📂 ${report.category}`,
      [] // remove buttons
    );
  }

  if (action === "delete") {
    await prisma.faultReport.delete({
      where: { id: faultId },
    });

    await deleteTelegramMessage(messageId);
  }

  return NextResponse.json({ ok: true });
}
