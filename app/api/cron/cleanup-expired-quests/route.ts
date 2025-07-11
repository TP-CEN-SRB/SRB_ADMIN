import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * Auto-delete expired quests.
 * This should be triggered daily via cron job.
 */
export const DELETE = async (req: NextRequest) => {
  try {
    const auth = req.headers.get("x-api-key");
    if (auth !== process.env.API_KEY) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find expired quests
    const expiredQuests = await prisma.questDetails.findMany({
      where: {
        endDate: {
          lt: now,
        },
      },
      select: { id: true },
    });

    if (expiredQuests.length === 0) {
      return NextResponse.json({ message: "No expired quests to delete" }, { status: 200 });
    }

    const questIds = expiredQuests.map((q) => q.id);

    // Delete userQuest entries first to maintain referential integrity
    await prisma.userQuest.deleteMany({
      where: {
        questId: { in: questIds },
      },
    });

    // Delete expired quests
    await prisma.questDetails.deleteMany({
      where: {
        id: { in: questIds },
      },
    });

    return NextResponse.json(
      { message: `Deleted ${questIds.length} expired quests.` },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "Unknown error" }, { status: 500 });
  }
};
