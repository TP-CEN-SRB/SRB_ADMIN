import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";
import { deleteTelegramMessage } from "@/lib/telegram";

export async function DELETE(
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

    /* ---------------- FETCH REPORT ---------------- */
    const report = await prisma.faultReport.findUnique({
      where: { id: params.id },
    });

    if (!report) {
      return NextResponse.json(
        { error: "Fault report not found" },
        { status: 404 }
      );
    }

    /* ---------------- TELEGRAM CLEANUP (BEST EFFORT) ---------------- */
    if (report.telegramMessageId) {
      void deleteTelegramMessage(
        Number(report.telegramMessageId) // BIGINT → number
      );
    }

    /* ---------------- DELETE DB ---------------- */
    await prisma.faultReport.delete({
      where: { id: params.id },
    });

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