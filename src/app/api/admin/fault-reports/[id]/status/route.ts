import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import {
  editTelegramMessage,
  editTelegramPhotoCaption,
} from "@/lib/telegram"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    console.log("---- PATCH /status called ----", id)

    const { status } = await req.json()

    if (!["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // 1️⃣ Fetch existing report
    const existing = await prisma.faultReport.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    if (existing.status === status) {
      return NextResponse.json({ success: true })
    }

    // 2️⃣ Update DB (source of truth)
    await prisma.faultReport.update({
      where: { id },
      data: {
        status,
        ...(status === "IN_PROGRESS" && {
          takenByAdminName: "Admin Dashboard",
        }),
        ...(status === "RESOLVED" && {
          resolvedByAdminName: "Admin Dashboard",
        }),
      },
    })

    // 3️⃣ Re-fetch (important)
    const report = await prisma.faultReport.findUnique({
      where: { id },
    })

    if (!report || !report.telegramMessageId) {
      console.log("ℹ️ No Telegram message to sync")
      return NextResponse.json({ success: true })
    }

    const telegramMessageId = Number(report.telegramMessageId)
    const isPhotoMessage = Boolean(report.faultimageUrl)

    const timeSGT =
      new Date().toLocaleString("en-SG", {
        timeZone: "Asia/Singapore",
        hour12: false,
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }) + " SGT"

    const updateTelegram = (
      text: string,
      buttons?: any[]
    ) => {
      if (isPhotoMessage) {
        void editTelegramPhotoCaption(
          telegramMessageId,
          text,
          buttons
        )
      } else {
        void editTelegramMessage(
          telegramMessageId,
          text,
          buttons
        )
      }
    }

    // 4️⃣ Sync Telegram
    if (status === "IN_PROGRESS") {
      updateTelegram(
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
      )
    }

    if (status === "RESOLVED") {
      updateTelegram(
`✅ FAULT RESOLVED
🆔 Report ID: ${report.id}

📍 Location: ${report.location}
📂 Category: ${report.category}
🛠 Type: ${report.type}
🕒 ${timeSGT}
📝 Description: ${report.description ?? "No description"}

👷 Resolved by: Admin Dashboard`,
        []
      )
    }

    console.log("✅ Telegram synced")

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ PATCH status error:", err)
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    )
  }
}