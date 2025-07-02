import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

export const GET = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ message: "Missing token" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decoded === "string")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDay.setHours(23, 59, 59, 999);

    // Step 1: Get all unique diplomas
    const allDiplomas = await prisma.user.findMany({
      where: {
        diploma: { not: null },
      },
      select: { diploma: true },
      distinct: ["diploma"],
    });

    // Initialize maps
    const diplomaPointsMap: Record<string, number> = {};
    const diplomaDisposalMap: Record<string, number> = {};

    for (const { diploma } of allDiplomas) {
      if (diploma) {
        diplomaPointsMap[diploma] = 0;
        diplomaDisposalMap[diploma] = 0;
      }
    }

    // Step 2: Get disposal data for this month
    const disposalData = await prisma.disposal.findMany({
      where: {
        createdAt: {
          gte: firstDay,
          lte: lastDay,
        },
        user: {
          diploma: { not: null },
        },
      },
      include: {
        user: {
          select: {
            diploma: true,
          },
        },
      },
    });

    // Step 3: Aggregate data
    for (const item of disposalData) {
      const diploma = item.user?.diploma;
      if (diploma) {
        diplomaPointsMap[diploma] += item.pointsAwarded;
        diplomaDisposalMap[diploma] += 1;
      }
    }

    // Step 4: Format and sort
    const sorted = Object.entries(diplomaPointsMap)
      .map(([diploma, totalPoints]) => ({
        diploma,
        totalPoints,
        disposalCount: diplomaDisposalMap[diploma] || 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    return NextResponse.json(sorted, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal error", error: (error as Error).message },
      { status: 500 }
    );
  }
};
