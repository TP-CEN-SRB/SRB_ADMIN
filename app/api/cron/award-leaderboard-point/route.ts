import prisma from "@/lib/db";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

/**
 * Award's the top 10 students who have earned the most points within the last month
 * Scheduled to run every month at 00:00 UTC
 */

// defines the bonus points awarded for top 10 point earners
const bonusPoints = [1000, 500, 300, 100, 50, 50, 50, 50, 50, 50];
export const POST = async (req: NextRequest) => {
  try {
    const authorization = req.headers.get("x-api-key");
    if (authorization !== process.env.API_KEY) {
      return NextResponse.json(
        { message: "Permission denied!" },
        { status: 401 }
      );
    }
    const today = new Date();
    // todo: uncomment this line of code after demonstration
    // check if it's the first day of the month
    // if (today.getDate() !== 1) {
    //   return NextResponse.json(
    //     {
    //       message:
    //         "Leaderboard points are only awarded on the first of every month",
    //     },
    //     { status: 400 }
    //   );
    // }
    const firstDayOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const lastDayOfLastmonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    );
    const topStudents = await prisma.disposal.groupBy({
      by: ["userId", "pointsAwarded"],
      where: {
        user: {
          role: "STUDENT" as Role,
        },
        isRedeemed: true,
        createdAt: {
          gte: firstDayOfLastMonth,
          lte: lastDayOfLastmonth,
        },
      },
      _sum: {
        pointsAwarded: true,
      },
      orderBy: {
        _sum: { pointsAwarded: "desc" },
      },
      take: 10,
    });
    await prisma.$transaction(
      topStudents
        .filter((student) => student.userId !== null)
        .map((student, index) => [
          prisma.point.update({
            where: { userId: student.userId as string },
            data: { balance: { increment: bonusPoints[index] } },
          }),
          prisma.transaction.create({
            data: {
              pointsChange: bonusPoints[index],
              description: `Awarded ${bonusPoints[index]} pts for ranking No. ${
                index + 1
              } in ${today.toLocaleString("default", {
                month: "short",
              })}`,
              transactionType: "OTHERS",
              userId: student.userId as string,
            },
          }),
        ])
        .flat()
    );
    return NextResponse.json(
      { message: "Leaderboard points have been awarded" },
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
