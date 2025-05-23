import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { TransactionType } from "@prisma/client";

const TREE_REWARD_POINTS = 100; // Change as needed

export const POST = async (req: NextRequest) => {
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

    const point = await prisma.point.findUnique({
      where: { userId: decodedToken.userId },
    });

    if (!point) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }

    const updatedPoint = await prisma.point.update({
      where: { userId: decodedToken.userId },
      data: { balance: { increment: TREE_REWARD_POINTS } },
    });

    await prisma.transaction.create({
      data: {
        pointsChange: TREE_REWARD_POINTS,
        description: `Claimed a tree and earned ${TREE_REWARD_POINTS} pts`,
        transactionType: TransactionType.TREE_REWARD,
        userId: decodedToken.userId,
      },
    });

    return NextResponse.json(
      { message: `Tree claimed! +${TREE_REWARD_POINTS} points awarded.` },
      { status: 200 }
    );
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
