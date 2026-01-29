import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

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

    // Check if report exists
    const existing = await prisma.faultReport.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Fault report not found" },
        { status: 404 }
      );
    }

    // Delete report
    await prisma.faultReport.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Fault report deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Delete Fault Report Error:", error);
    return NextResponse.json(
      { error: "Failed to delete fault report" },
      { status: 500 }
    );
  }
}
