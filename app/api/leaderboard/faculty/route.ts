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

    // Date range for current month
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    // Step 1: Get all distinct faculties from users
    const allFaculties = await prisma.user.findMany({
      where: {
        role: Role.STUDENT,
      },
      select: {
        faculty: true,
      },
      distinct: ["faculty"],
    });

    // Step 2: Get disposal records for current month with faculty info
    const allDisposals = await prisma.disposal.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        user: {
          role: Role.STUDENT,
        },
      },
      include: {
        user: {
          select: {
            faculty: true,
          },
        },
      },
    });

    // Step 3: Initialize all faculties with 0 points
    const facultyPointsMap = new Map<string, number>();
    for (const { faculty } of allFaculties) {
      if (faculty) facultyPointsMap.set(faculty, 0);
    }

    // Step 4: Sum points for each faculty
    for (const disposal of allDisposals) {
      const faculty = disposal.user?.faculty;
      if (!faculty) continue;

      const prev = facultyPointsMap.get(faculty) || 0;
      facultyPointsMap.set(faculty, prev + disposal.pointsAwarded);
    }

    // Step 5: Format and sort
    const rankedFaculties = Array.from(facultyPointsMap.entries())
      .map(([faculty, points]) => ({ faculty, points }))
      .sort((a, b) => b.points - a.points);

    return NextResponse.json({ facultyLeaderboard: rankedFaculties }, { status: 200 });
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
