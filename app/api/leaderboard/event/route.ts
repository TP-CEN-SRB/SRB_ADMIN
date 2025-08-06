import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

export const GET = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Missing authorization header!" },
        { status: 401 }
      );
    }

    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decodedToken === "string") {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }

    // Step 1: Get the latest event
    const latestEvent = await prisma.event.findFirst({
      orderBy: { createdAt: "desc" },
    });

    if (!latestEvent) {
      return NextResponse.json(
        { message: "No active event found." },
        { status: 404 }
      );
    }

    // Step 2: Aggregate total points for students within the event's date range
    const disposals = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        disposals: {
          some: {
            createdAt: {
              gte: latestEvent.startDate,
              lte: latestEvent.endDate,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        faculty: true,
        diploma: true,
        disposals: {
          where: {
            createdAt: {
              gte: latestEvent.startDate,
              lte: latestEvent.endDate,
            },
          },
          select: {
            pointsAwarded: true,
          },
        },
      },
    });

    const leaderboard = disposals.map((user) => ({
      username: user.name,
      userId: user.id,
      diploma: user.diploma ?? null,
      faculty: user.faculty ?? null,
      points: user.disposals.reduce((total, d) => total + d.pointsAwarded, 0),
    }));

    leaderboard.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return (a.diploma ?? "").localeCompare(b.diploma ?? "");
    });

    return NextResponse.json({ event: leaderboard }, { status: 200 });

  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ message: "Token has expired!" }, { status: 401 });
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Token is invalid!" }, { status: 401 });
    } else if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
