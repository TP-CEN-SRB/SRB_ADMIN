import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { Role, Faculty } from "@prisma/client";

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
      .filter((id): id is string => id !== null); // ✅ Type-safe filter

    if (userIds.length === 0) {
      return NextResponse.json({ students: [] }, { status: 200 });
    }

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    });

    const students = users.map((user) => {
      const stats = studentPoints.find((sp) => sp.userId === user.id);
      return {
        name: user.name,
        points: stats?._sum.pointsAwarded || 0,
        disposalCount: stats?._count.id || 0,
      };
    });

    return NextResponse.json({ FacultyCategory:students }, { status: 200 });
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
