import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * Clean up expired quests, create 3 new ones, and assign to all users.
 */
export const PUT = async (req: NextRequest) => {
  try {
    const authorization = req.headers.get("x-api-key");
    if (authorization !== process.env.API_KEY) {
      return NextResponse.json({ message: "Permission denied!" }, { status: 401 });
    }

    const now = new Date();

    // 1. Delete expired quests
    const deleted = await prisma.questDetails.deleteMany({
      where: {
        endDate: { lt: now },
      },
    });

    // 2. Fetch templates and randomly select 3
    const templates = await prisma.questTemplate.findMany();
    if (templates.length < 3) {
      return NextResponse.json(
        { message: "Not enough templates to generate quests" },
        { status: 400 }
      );
    }

    const selected = templates.sort(() => Math.random() - 0.5).slice(0, 3);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + 7); // 1 week duration

    // 3. Create the 3 quests
    const createdQuests = await Promise.all(
      selected.map((q) =>
        prisma.questDetails.create({
          data: {
            title: q.title,
            description: q.description,
            target: q.target,
            rewardPoints: q.rewardPoints,
            materialType: q.materialType,
            startDate,
            endDate,
          },
        })
      )
    );

    // 4. Assign each quest to all users
    const users = await prisma.user.findMany({ where: { role: "STUDENT" } });
    const assignments = createdQuests.flatMap((quest) =>
      users.map((user) => ({
        userId: user.id,
        questId: quest.id,
      }))
    );

    await prisma.user_quest.createMany({
      data: assignments,
      skipDuplicates: true,
    });

    return NextResponse.json(
      {
        message: `Deleted ${deleted.count} expired quest(s), created and assigned 3 new quest(s) to ${users.length} users.`,
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
