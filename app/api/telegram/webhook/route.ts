import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  editTelegramMessage,
  deleteTelegramMessage,
  answerTelegramCallback,
} from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const callback = body.callback_query;

  // Telegram may send non-callback updates
  if (!callback) return NextResponse.json({ ok: true });

  const callbackId = callback.id;
  const messageId = callback.message.message_id;
  const data = callback.data; // fault:take:<id>

  // 🔑 IMPORTANT: ACK TELEGRAM IMMEDIATELY
  await answerTelegramCallback(callbackId);

  const [, action, faultId] = data.split(":");

  // Respond early (prevents retries)
  const response = NextResponse.json({ ok: true });

  // --------------------
  // BACKGROUND LOGIC
  // --------------------
  (async () => {
    const report = await prisma.faultReport.findUnique({
      where: { id: faultId },
    });

    if (!report) {
      void deleteTelegramMessage(messageId);
      return;
    }

    // TAKE JOB
    if (action === "take" && report.status === "OPEN") {
      await prisma.faultReport.update({
        where: { id: faultId },
        data: { status: "IN_PROGRESS" },
      });

      void editTelegramMessage(
        messageId,
        `🛠 *REPAIR IN PROGRESS*
📍 ${report.location}
📂 ${report.category}`,
        [
          [
            { text: "✅ Resolved", callback_data: `fault:resolve:${faultId}` },
            { text: "🗑 Delete", callback_data: `fault:delete:${faultId}` },
          ],
        ]
      );
    }

    // RESOLVE
    if (action === "resolve" && report.status === "IN_PROGRESS") {
      await prisma.faultReport.update({
        where: { id: faultId },
        data: { status: "RESOLVED" },
      });

      void editTelegramMessage(
        messageId,
        `✅ *FAULT RESOLVED*
📍 ${report.location}
📂 ${report.category}`,
        [] // remove buttons
      );
    }

    // DELETE
    if (action === "delete") {
      await prisma.faultReport.delete({
        where: { id: faultId },
      });

      void deleteTelegramMessage(messageId);
    }
  })().catch(console.error);

  return response;
}
