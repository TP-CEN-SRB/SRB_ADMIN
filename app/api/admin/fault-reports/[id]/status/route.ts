import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();

    if (!["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    await prisma.faultReport.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Update fault status error:", err);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}