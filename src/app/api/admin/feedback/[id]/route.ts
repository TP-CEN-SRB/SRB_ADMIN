import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Missing feedback id" },
        { status: 400 }
      );
    }

    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE FEEDBACK]", error);
    return NextResponse.json(
      { error: "Failed to delete feedback" },
      { status: 500 }
    );
  }
}