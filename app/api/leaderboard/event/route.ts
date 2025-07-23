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

    const userIds = participants.map((p) => p.user.id);

    // Step 3: Fetch disposal and redemption counts, and disposal data
    const [userDisposals, userRedemptions, allDisposals] = await Promise.all([
      prisma.disposal.groupBy({
        by: ["userId"],
        _count: { id: true },
        where: {
          userId: { in: userIds },
        },
      }),
      prisma.redemption.groupBy({
        by: ["userId"],
        _count: { id: true },
        where: {
          userId: { in: userIds },
        },
      }),
      prisma.disposal.findMany({
        where: {
          userId: { in: userIds },
        },
        include: {
          user: { select: { id: true } },
          bin: {
            include: {
              binMaterial: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Step 4: Assemble payload
    const orderedDisposals = participants.map((entry) => {
      const userId = entry.user.id;

      const disposal = userDisposals.find((d) => d.userId === userId) || {
        _count: { id: 0 },
      };
      const redemption = userRedemptions.find((r) => r.userId === userId) || {
        _count: { id: 0 },
      };

      const userDisposalData = allDisposals.filter((d) => d.user?.id === userId);
      const materialCounts = userDisposalData.reduce((acc, item) => {
        const material = item.bin?.binMaterial?.name;
        if (material) acc[material] = (acc[material] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const mostFrequentMaterial = Object.entries(materialCounts).reduce(
        (max, [material, count]) =>
          count > (max[1] || 0) ? [material, count] : max,
        ["", 0]
      )[0];

      return {
        username: entry.user.name,
        userId,
        balance: entry.progress ?? 0, // use EVENT progress as points
        disposalCount: disposal._count.id,
        redemptionCount: redemption._count.id,
        mostFrequentMaterial: mostFrequentMaterial || undefined,
        diploma: entry.user.diploma || null,
        faculty: entry.user.faculty || null,
      };
    });

    // Step 5: Sort by points (balance), then by diploma
    const sortedDisposals = orderedDisposals.sort((a, b) => {
      if (b.balance !== a.balance) return b.balance - a.balance;
      const diplomaA = a.diploma?.toUpperCase() || "";
      const diplomaB = b.diploma?.toUpperCase() || "";
      return diplomaA.localeCompare(diplomaB);
    });

    return NextResponse.json({ orderedDisposals: sortedDisposals }, { status: 200 });
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
