import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

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
    const { rewardId } = await req.json();
    if (!rewardId) {
      return NextResponse.json(
        { message: "Missing rewardId parameter!" },
        { status: 400 }
      );
    }
    const reward = await prisma.reward.findUnique({ where: { id: rewardId } });
    if (!reward) {
      return NextResponse.json(
        { message: "Reward not found!" },
        { status: 404 }
      );
    }

    const point = await prisma.point.findUnique({
      where: { userId: decodedToken.userId },
    });
    if (!point) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }
    // Check if the user has enough points to redeem the reward
    // status 406 is for Not Acceptable
    if (point.balance < reward.pointsRequired) {
      return NextResponse.json(
        {
          message: `Insufficient points. You need ${reward.pointsRequired} points to redeem this reward.`,
        },
        { status: 406 }
      );
    }

    const [redemption, updatedPoint] = await prisma.$transaction([
      prisma.redemption.create({
        data: {
          user: { connect: { id: decodedToken.userId } },
          reward: { connect: { id: rewardId } },
        },
      }),
      prisma.point.update({
        where: { userId: decodedToken.userId },
        data: { balance: { decrement: reward.pointsRequired } },
      }),
    ]);
    if (!updatedPoint || !redemption) {
      return NextResponse.json(
        { message: "Error redeeming reward!" },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: `Reward Redeemed!` }, { status: 200 });
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
