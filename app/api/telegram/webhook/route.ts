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

  if (!callback) return NextResponse.json({ ok: true });

  const callbackId = callback.id;
  const messageId = callback.message.message_id;
  const data = callback.data;

  const [, action, faultId] = data.split(":");

  // ✅ ACK IMMEDIATELY (stop spinner, prevent retries)
  await answerTelegramCallback(callbackId);

  // ✅ Respond immediately to Telegram
  const response = NextResponse.json({ ok: true });

  // 🔄 Background processing
  (async () => {
    const report = await prisma.faultReport.findUnique({
      where: { id: faultId },
    });

    if (!report) {
      void deleteTelegramMessage(messageId);
      return;
    }

    // 🛠 TAKE JOB
    if (action === "take" && report.status === "OPEN") {
      // instant UI update
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

      await prisma.faultReport.update({
        where: { id: faultId },
        data: { status: "IN_PROGRESS" },
      });

      return;
    }

    // ✅ RESOLVE
    if (action === "resolve" && report.status === "IN_PROGRESS") {
      void editTelegramMessage(
        messageId,
`✅ *FAULT RESOLVED*
📍 ${report.location}
📂 ${report.category}`,
        []
      );

      await prisma.faultReport.update({
        where: { id: faultId },
        data: { status: "RESOLVED" },
      });

      return;
    }

    // 🗑 DELETE
    if (action === "delete") {
      // immediate visual feedback
      void editTelegramMessage(
        messageId,
        "🗑 *Deleting fault report…*",
        []
      );

      await prisma.faultReport.delete({
        where: { id: faultId },
      });

      void deleteTelegramMessage(messageId);
      return;
    }
  })().catch(console.error);

  return response;
}
