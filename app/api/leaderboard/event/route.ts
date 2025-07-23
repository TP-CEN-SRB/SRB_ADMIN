import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { Role } from "@prisma/client";

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

    // Step 1: Find the latest EVENT quest
    const eventQuest = await prisma.questDetails.findFirst({
      where: {
        questType: "EVENT",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!eventQuest) {
      return NextResponse.json(
        { message: "No active event quest found." },
        { status: 404 }
      );
    }

    // Step 2: Fetch all participants (including 0 points)
    const participants = await prisma.userQuest.findMany({
      where: {
        questId: eventQuest.id,
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

    // Step 3: Format leaderboard entries
    const leaderboard = participants.map((entry) => ({
      userId: entry.user.id,
      username: entry.user.name,
      faculty: entry.user.faculty,
      diploma: entry.user.diploma,
      points: entry.progress ?? 0,
    }));

    // Step 4: Sort descending by points
    const sorted = leaderboard.sort((a, b) => {
    if (b.points !== a.points) {
        return b.points - a.points; // sort by points descending
    }

    // If points are equal, sort by diploma (case-insensitive)
    const diplomaA = a.diploma?.toUpperCase() || "";
    const diplomaB = b.diploma?.toUpperCase() || "";
    return diplomaA.localeCompare(diplomaB);
    });

    return NextResponse.json({ leaderboard: sorted }, { status: 200 });
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
