import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import { TransactionType } from "@/generated/prisma";

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Missing authorization header!" }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decodedToken === "string") {
      return NextResponse.json({ message: "Unauthorized access!" }, { status: 401 });
    }

    const { pointsAwarded } = await req.json();

    if (!pointsAwarded || typeof pointsAwarded !== "number" || pointsAwarded <= 0) {
      return NextResponse.json({ message: "Invalid or missing pointsAwarded value." }, { status: 400 });
    }

    const point = await prisma.point.findUnique({
      where: { userId: decodedToken.userId },
    });

    if (!point) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }

    const updatedPoint = await prisma.point.update({
      where: { userId: decodedToken.userId },
      data: { balance: { increment: pointsAwarded } },
    });

    try {
      await prisma.transaction.create({
        data: {
          pointsChange: pointsAwarded,
          description: `Claimed a tree and earned ${pointsAwarded} pts via wheel spin`,
          transactionType: TransactionType.TREE_REWARD,
          userId: decodedToken.userId,
        },
      });
    } catch (err) {
      console.error("Transaction logging failed:", err);
    }

    return NextResponse.json({ points: pointsAwarded }, { status: 200 });

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
