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
    const date = new Date();
    const firstDayofMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayofMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const data = await prisma.point.groupBy({
      by: ["userId", "balance"],
      where: {
        user: {
          role: "STUDENT" as Role,
        },
        createdAt: {
          gte: firstDayofMonth,
          lte: lastDayofMonth,
        },
      },
      orderBy: {
        balance: "desc", // Order by the count of points, descending
      },
      take: 10, // Get the top 10 users
    });
    const userIds = data.map((user) => user.userId); // Extract the user IDs in order

    const userDisposals = await prisma.disposal.groupBy({
      by: ["userId"],
      _count: {
        id: true, // Count disposals
      },
      where: {
        userId: {
          in: userIds, // Filter by the top user IDs
        },
      },
    });

    const userRedemptions = await prisma.redemption.groupBy({
      by: ["userId"],
      _count: {
        id: true,
      },
      where: {
        userId: {
          in: userIds, // Filter by the top user IDs
        },
      },
    });
    const orderedDisposals = await Promise.all(
      userIds.map(async (userId) => {
        const disposal = userDisposals.find((d) => d.userId === userId);
        const name = await prisma.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            name: true,
            email: true,
          },
        });
        return {
          rank: userIds.indexOf(userId) + 1,
          username: name?.name || null,
          adminNo: name?.email.split("@")[0].toUpperCase() || null,
          balance: data.find((d) => d.userId === userId)?.balance || 0, // Include balance or 0 if no balance
          disposalCount: disposal ? disposal._count.id : 0, // Include count or 0 if no disposals
          redemptionCount:
            userRedemptions.find((r) => r.userId === userId) || 0,
        };
      })
    );

    return NextResponse.json({ orderedDisposals }, { status: 200 });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { message: "Token has expired!" },
        { status: 401 }
      );
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: "Token is invalid!" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
