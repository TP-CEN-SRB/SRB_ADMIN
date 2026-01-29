import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const reports = await prisma.faultReport.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(reports);
  } catch (err) {
    console.error("❌ Failed to fetch fault reports:", err);
    return NextResponse.json(
      { error: "Failed to fetch fault reports" },
      { status: 500 }
    );
  }
}
