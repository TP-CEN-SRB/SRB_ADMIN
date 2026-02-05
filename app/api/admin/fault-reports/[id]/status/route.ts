import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";
import { editTelegramMessage } from "@/lib/telegram";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    /* ---------------- AUTH ---------------- */
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 401 });
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXT_JWT_SECRET_KEY!
    ) as { userId: string };

    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const adminName = admin.name || admin.email;

    /* ---------------- BODY ---------------- */
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

    /* ---------------- DB UPDATE ---------------- */
    await prisma.faultReport.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === "IN_PROGRESS" && {
          takenByAdminId: admin.id,
          takenByAdminName: adminName,
        }),
        ...(status === "RESOLVED" && {
          resolvedByAdminId: admin.id,
          resolvedByAdminName: adminName,
        }),
      },
    });

    /* ---------------- TELEGRAM SYNC ---------------- */
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