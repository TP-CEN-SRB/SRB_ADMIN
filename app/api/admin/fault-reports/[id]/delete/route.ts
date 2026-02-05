import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { deleteTelegramMessage } from "@/lib/telegram";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log("---- DELETE /delete called ----");
    console.log("Report ID:", params.id);

    if (!params.id) {
      return NextResponse.json(
        { error: "Missing report id" },
        { status: 400 }
      );
    }

    // Fetch once (need telegramMessageId)
    const report = await prisma.faultReport.findUnique({
      where: { id: params.id },
      select: { id: true, telegramMessageId: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // --------------------
    // DELETE DB (SOURCE OF TRUTH)
    // --------------------
    await prisma.faultReport.delete({
      where: { id: params.id },
    });

    console.log("✅ DB record deleted");

    // --------------------
    // TELEGRAM CLEANUP (BEST EFFORT)
    // --------------------
    if (report.telegramMessageId) {
      void deleteTelegramMessage(Number(report.telegramMessageId));
      console.log("✅ Telegram message deleted");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ Delete fault error:", err);
    return NextResponse.json(
      { error: "Failed to delete fault report" },
      { status: 500 }
    );
  }
}