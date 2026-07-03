import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";

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

    const allDiplomas = await prisma.user.findMany({
      where: {
        diploma: { not: null },
      },
      select: { diploma: true },
      distinct: ["diploma"],
    });

    const diplomaPointsMap: Record<string, number> = {};
    const diplomaDisposalMap: Record<string, number> = {};

    for (const { diploma } of allDiplomas) {
      if (diploma) {
        diplomaPointsMap[diploma] = 0;
        diplomaDisposalMap[diploma] = 0;
      }
    }

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

    for (const item of disposalData) {
      const diploma = item.user?.diploma;
      if (diploma) {
        diplomaPointsMap[diploma] += item.pointsAwarded; // original DB field
        diplomaDisposalMap[diploma] += 1;
      }
    }

    const sorted = Object.entries(diplomaPointsMap)
      .map(([diploma, points]) => ({
        diploma,
        points,
        disposalCount: diplomaDisposalMap[diploma] || 0,
      }))
      .sort((a, b) => b.points - a.points);

    return NextResponse.json({ diplomaLeaderboard: sorted }, { status: 200 });

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
