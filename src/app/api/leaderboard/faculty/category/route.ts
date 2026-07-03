import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import { Role, Faculty } from "@/generated/prisma";

export const GET = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ message: "Missing token" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decoded === "string")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");

    if (!name || !(name in Faculty)) {
      return NextResponse.json({ message: "Invalid faculty name" }, { status: 400 });
    }

    const faculty = name as Faculty;

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    // Step 1: Disposal Points Grouped by User
    const studentPoints = await prisma.disposal.groupBy({
      by: ["userId"],
      where: {
        createdAt: { gte: start, lte: end },
        user: {
          role: Role.STUDENT,
          faculty,
        },
      },
      _sum: { pointsAwarded: true },
      _count: { id: true },
      orderBy: { _sum: { pointsAwarded: "desc" } },
    });

    const userIds = studentPoints
      .filter((s) => s._sum.pointsAwarded && s._sum.pointsAwarded > 0)
      .map((s) => s.userId)
      .filter((id): id is string => id !== null);

    if (userIds.length === 0) {
      return NextResponse.json({ FacultyCategory: [] }, { status: 200 });
    }

    // Step 2: Fetch Users, Redemptions, and All Disposal Records for Materials
    const [users, redemptions, allDisposals] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, diploma: true, faculty: true },
      }),
      prisma.redemption.groupBy({
        by: ["userId"],
        _count: { id: true },
        where: { userId: { in: userIds } },
      }),
      prisma.disposal.findMany({
        where: { userId: { in: userIds } },
        include: {
          bin: {
            include: {
              binMaterial: {
                select: { name: true },
              },
            },
          },
        },
      }),
    ]);

    // Step 3: Assemble response
    const result = users.map((user) => {
      const stats = studentPoints.find((s) => s.userId === user.id);
      const disposalCount = stats?._count.id || 0;
      const balance = stats?._sum.pointsAwarded || 0;

      const redemptionCount =
        redemptions.find((r) => r.userId === user.id)?._count.id || 0;

      const userDisposals = allDisposals.filter((d) => d.userId === user.id);
      const materialFrequency: Record<string, number> = {};
      for (const d of userDisposals) {
        const material = d.bin?.binMaterial?.name;
        if (material) {
          materialFrequency[material] = (materialFrequency[material] || 0) + 1;
        }
      }

      const mostFrequentMaterial =
        Object.entries(materialFrequency).reduce(
          (max, [material, count]) =>
            count > max[1] ? [material, count] : max,
          ["", 0]
        )[0] || null;

      return {
        username: user.name,
        userId: user.id,
        balance,
        disposalCount,
        redemptionCount,
        mostFrequentMaterial,
        diploma: user.diploma,
        faculty: user.faculty,
      };
    });

    result.sort((a, b) => b.balance - a.balance);
    return NextResponse.json({ FacultyCategory: result }, { status: 200 });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      return NextResponse.json({ message: "Token expired" }, { status: 401 });
    if (error instanceof jwt.JsonWebTokenError)
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    return NextResponse.json(
      { message: "Internal error", error: (error as Error).message },
      { status: 500 }
    );
  }
};
