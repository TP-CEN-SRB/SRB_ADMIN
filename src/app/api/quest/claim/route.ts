import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/db"
import { TransactionType } from "@/generated/prisma"

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ message: "Missing authorization header!" }, { status: 401 })
    }

    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!)
    if (typeof decodedToken === "string") {
      return NextResponse.json({ message: "Unauthorized access!" }, { status: 401 })
    }

    const { userQuestId, isCompleted } = await req.json() // <- accepts isCompleted
    const userId = decodedToken.userId

    if (!userQuestId || typeof userQuestId !== "string") {
      return NextResponse.json({ message: "Missing or invalid userQuestId." }, { status: 400 })
    }

    const userQuest = await prisma.userQuest.findUnique({
      where: { id: userQuestId },
      include: { quest: true },
    })

    if (!userQuest) {
      return NextResponse.json({ message: "User quest not found!" }, { status: 404 })
    }

    if (userQuest.userId !== userId) {
      return NextResponse.json({ message: "Unauthorized: This quest does not belong to you." }, { status: 403 })
    }

    const pointsAwarded = userQuest.quest.rewardPoints

    if (!pointsAwarded || pointsAwarded <= 0) {
      return NextResponse.json({ message: "Invalid reward points." }, { status: 400 })
    }

    
    await prisma.userQuest.update({
      where: { id: userQuestId },
      data: {
        isCompleted: true,
        completedAt: new Date(),
      },
    })

  
    await prisma.point.update({
      where: { userId },
      data: { balance: { increment: pointsAwarded } },
    })


    try {
      await prisma.transaction.create({
        data: {
          pointsChange: pointsAwarded,
          description: `Claimed ${pointsAwarded} pts for completing quest "${userQuest.quest.title}"`,
          transactionType: TransactionType.QUEST_REWARD,
          userId,
        },
      })
    } catch (err) {
      console.error("Transaction logging failed:", err)
    }

    return NextResponse.json(
      { message: "Quest marked as completed and reward claimed!", points: pointsAwarded },
      { status: 200 }
    )

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ message: "Token has expired!" }, { status: 401 })
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Token is invalid!" }, { status: 401 })
    } else if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "An unknown error occurred" }, { status: 500 })
  }
}
