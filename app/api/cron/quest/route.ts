import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * Automatically create 3 random quests from quest_template.
 * Scheduled to run via cron job.
 */
export const PUT = async (req: NextRequest) => {
  try {
    const authorization = req.headers.get("x-api-key");
    if (authorization !== process.env.API_KEY) {
      return NextResponse.json(
        { message: "Permission denied!" },
        { status: 401 }
      );
    }

    const templates = await prisma.questTemplate.findMany();
    if (!templates || templates.length < 3) {
      return NextResponse.json(
        { message: "Not enough templates to generate quests" },
        { status: 400 }
      );
    }

    // Shuffle and take 3 random quests
    const selected = templates.sort(() => Math.random() - 0.5).slice(0, 3);

    await prisma.questDetails.createMany({
      data: selected.map((q) => ({
        title: q.title,
        description: q.description,
        target: q.target,
        rewardPoints: q.rewardPoints,
        materialType: q.materialType,
      })),
    });

    return NextResponse.json(
      { message: "3 quests created successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
