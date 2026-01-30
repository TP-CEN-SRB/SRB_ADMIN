import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  editTelegramMessage,
  editTelegramPhotoCaption,
  deleteTelegramMessage,
  answerTelegramCallback,
} from "@/lib/telegram";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const callback = body.callback_query;

  if (!callback) return NextResponse.json({ ok: true });

  const callbackId = callback.id;
  const message = callback.message;
  const messageId = message.message_id;
  const data = callback.data;

  const [, action, faultId] = data.split(":");

  // 🔑 ACK IMMEDIATELY — stops spinner, prevents retries
  await answerTelegramCallback(callbackId);

  // ✅ Respond immediately to Telegram
  const response = NextResponse.json({ ok: true });

  // Determine message type
  const isPhotoMessage = Array.isArray(message.photo);

  // Helper to update message safely
  const updateMessage = (
    text: string,
    buttons?: any[]
  ) => {
    if (isPhotoMessage) {
      void editTelegramPhotoCaption(messageId, text, buttons);
    } else {
      void editTelegramMessage(messageId, text, buttons);
    }
  };

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

    // 🛠 TAKE JOB
    if (action === "take" && report.status === "OPEN") {
      // 🔥 INSTANT UI FEEDBACK
      updateMessage(
        "⏳ *Taking repair job…*",
        []
      );

      await prisma.faultReport.update({
        where: { id: faultId },
        data: { status: "IN_PROGRESS" },
      });

      updateMessage(
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

      return;
    }

    // ✅ RESOLVE
    if (action === "resolve" && report.status === "IN_PROGRESS") {
      updateMessage(
        "⏳ *Resolving fault…*",
        []
      );

      await prisma.faultReport.update({
        where: { id: faultId },
        data: { status: "RESOLVED" },
      });

      updateMessage(
        `✅ *FAULT RESOLVED*
📍 ${report.location}
📂 ${report.category}`,
        []
      );

      return;
    }

    // 🗑 DELETE
    if (action === "delete") {
      // 🔥 IMMEDIATE FEEDBACK
      updateMessage(
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
