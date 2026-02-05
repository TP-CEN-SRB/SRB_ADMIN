import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const reports = await prisma.faultReport.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        location: true,
        category: true,
        type: true,
        description: true,
        faultimageUrl: true,
        status: true,
        createdAt: true,

        // Dashboard display fields (SAFE)
        takenByTelegramName: true,
        resolvedByTelegramName: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(reports, { status: 200 });
  } catch (err) {
    console.error("❌ Failed to fetch fault reports:", err);
    return NextResponse.json(
      { error: "Failed to fetch fault reports" },
      { status: 500 }
    );
  }
}