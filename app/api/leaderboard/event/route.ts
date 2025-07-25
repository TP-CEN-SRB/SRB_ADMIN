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

    // Step 2: Fetch all UserEvent entries for the event
    const userEvents = await prisma.userEvent.findMany({
      where: {
        eventId: latestEvent.id,
        user: {
          role: "STUDENT",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            faculty: true,
            diploma: true,
          },
        },
      },
    });

    // Step 3: Assemble leaderboard data with 'points'
    const leaderboard = userEvents.map((entry) => ({
      username: entry.user.name,
      userId: entry.user.id,
      points: entry.points ?? 0,
      diploma: entry.user.diploma ?? null,
      faculty: entry.user.faculty ?? null,
    }));

    // Step 4: Sort by points then diploma
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
  