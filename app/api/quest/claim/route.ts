import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { TransactionType } from "@prisma/client";

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Missing authorization header!" }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decodedToken === "string") {
      return NextResponse.json({ message: "Unauthorized access!" }, { status: 401 });
    }

    const { questId } = await req.json();
    const userId = decodedToken.userId;

    if (!questId || typeof questId !== "string") {
      return NextResponse.json({ message: "Invalid or missing questId." }, { status: 400 });
    }

    // Get user's quest progress
    const userQuest = await prisma.userQuest.findFirst({
      where: { userId, questId },
      include: { quest: true },
    });

    if (!userQuest) {
      return NextResponse.json({ message: "User quest not found!" }, { status: 404 });
    }

    if (!userQuest.isCompleted) {
      return NextResponse.json({ message: "Quest not completed yet." }, { status: 400 });
    }

    const pointsAwarded = userQuest.quest.rewardPoints;

    if (!pointsAwarded || pointsAwarded <= 0) {
      return NextResponse.json({ message: "Invalid reward points." }, { status: 400 });
    }

    // Update point balance
    const updatedPoint = await prisma.point.update({
      where: { userId },
      data: { balance: { increment: pointsAwarded } },
    });

    // Log transaction
    try {
      await prisma.transaction.create({
        data: {
          pointsChange: pointsAwarded,
          description: `Claimed ${pointsAwarded} pts for completing quest "${userQuest.quest.title}"`,
          transactionType: TransactionType.QUEST_REWARD,
          userId,
        },
      });
    } catch (err) {
      console.error("Transaction logging failed:", err);
    }

    return NextResponse.json(
      { message: "Reward claimed successfully!", points: pointsAwarded },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ message: "Token has expired!" }, { status: 401 });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Token is invalid!" }, { status: 401 });
    } else if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 });
  }
};
