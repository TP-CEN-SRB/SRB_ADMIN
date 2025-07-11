import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * Clean up expired quests and create 3 new quests weekly.
 */
export const PUT = async (req: NextRequest) => {
  try {
    const authorization = req.headers.get("x-api-key");
    if (authorization !== process.env.API_KEY) {
      return NextResponse.json({ message: "Permission denied!" }, { status: 401 });
    }

    const now = new Date();

    // 1. CLEAN UP EXPIRED QUESTS
    const deleted = await prisma.questDetails.deleteMany({
      where: {
        endDate: {
          lt: now,
        },
      },
    });

    // 2. CREATE 3 NEW QUESTS FROM TEMPLATE
    const templates = await prisma.questTemplate.findMany();
    if (!templates || templates.length < 3) {
      return NextResponse.json(
        { message: "Not enough templates to generate quests" },
        { status: 400 }
      );
    }

    const selected = templates.sort(() => Math.random() - 0.5).slice(0, 3);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7); // +7 days

    await prisma.questDetails.createMany({
      data: selected.map((q) => ({
        title: q.title,
        description: q.description,
        target: q.target,
        rewardPoints: q.rewardPoints,
        materialType: q.materialType,
        startDate,
        endDate,
      })),
    });

    return NextResponse.json(
      {
        message: `Deleted ${deleted.count} expired quest(s), added 3 new quest(s).`,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
