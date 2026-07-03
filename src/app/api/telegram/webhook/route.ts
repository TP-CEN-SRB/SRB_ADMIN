import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  editTelegramMessage,
  editTelegramPhotoCaption,
  deleteTelegramMessage,
  answerTelegramCallback,
} from "@/lib/telegram";

function formatTelegramUser(from: any) {
  if (from.username) {
    return `@${from.username}`;
  }
  return `${from.first_name}${from.last_name ? " " + from.last_name : ""}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const callback = body.callback_query;

  if (!callback) return NextResponse.json({ ok: true });

  const callbackId = callback.id;
  const message = callback.message;
  const messageId = message.message_id;
  const data = callback.data;
  const from = callback.from;

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

  const [, action, faultId] = data.split(":");

  // 🔑 ACK IMMEDIATELY — stops spinner, prevents retries
  await answerTelegramCallback(callbackId);

  // ✅ Respond immediately to Telegram
  const response = NextResponse.json({ ok: true });

  // Determine message type
  const isPhotoMessage = Array.isArray(message.photo);
  const actorName = formatTelegramUser(from);
  const actorId = BigInt(from.id);

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
        data: {
          status: "IN_PROGRESS",
          takenByTelegramId: actorId,
          takenByTelegramName: actorName,
        },
      });

    updateMessage(
`🛠 REPAIR IN PROGRESS
🆔 Report ID: ${report.id}

📍 Location: ${report.location}
📂 Category: ${report.category}
🛠 Type: ${report.type}
🕒 ${timeSGT}

📝 Description: ${report.description ?? "No description"}

👷 Taken by: ${actorName}`,
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
        data: {
          status: "RESOLVED",
          resolvedByTelegramId: actorId,
          resolvedByTelegramName: actorName,
        },
      });

      updateMessage(
`✅ *FAULT RESOLVED*
🆔 Report ID: ${report.id}

📍 Location: ${report.location}
📂 Category: ${report.category}
🛠 Type: ${report.type}
🕒 ${timeSGT}
📝 Description: ${report.description ?? "No description"}

👷 Resolved by: ${actorName}`,
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
