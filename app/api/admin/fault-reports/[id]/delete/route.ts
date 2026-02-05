import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { deleteTelegramMessage } from "@/lib/telegram";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Fault report ID is required" },
        { status: 400 }
      );
    }

    // Fetch once (need telegramMessageId)
    const existing = await prisma.faultReport.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Fault report not found" },
        { status: 404 }
      );
    }

    // --------------------
    // DELETE DB (SOURCE OF TRUTH)
    // --------------------
    await prisma.faultReport.delete({
      where: { id },
    });

    // --------------------
    // TELEGRAM CLEANUP (BEST EFFORT)
    // --------------------
    if (existing.telegramMessageId) {
      void deleteTelegramMessage(existing.telegramMessageId);
    }

    return NextResponse.json({
      success: true,
      message: "Fault report deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Fault Report Error:", error);
    return NextResponse.json(
      { error: "Failed to delete fault report" },
      { status: 500 }
    );
  }
}