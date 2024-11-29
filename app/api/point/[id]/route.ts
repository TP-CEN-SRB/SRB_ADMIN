import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
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
    const userId = params.id;
    if (decodedToken.userId !== userId) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    const point = await prisma.point.findUnique({
      where: { userId: userId },
    });

    if (!point) {
      return NextResponse.json(
        { message: "Points not found for user" },
        { status: 404 }
      );
    }

    const pointsExpiryDate = new Date(point.updatedAt);
    pointsExpiryDate.setMonth(pointsExpiryDate.getMonth() + 3);
    const pointsToExpire = Math.ceil(point.balance * 0.1);
    // check if point should expire
    if (new Date() > pointsExpiryDate) {
      const updatedPoint = await prisma.point.update({
        where: { id: point.id },
        data: {
          balance: { decrement: pointsToExpire },
        },
      });
      const updatedPointsExpiryDate = new Date(updatedPoint.updatedAt);
      updatedPointsExpiryDate.setMonth(updatedPointsExpiryDate.getMonth() + 3);
      const updatedPointsToExpire = Math.ceil(updatedPoint.balance * 0.1);
      return NextResponse.json(
        {
          point: updatedPoint.balance,
          message: `${updatedPointsToExpire} ${
            updatedPointsToExpire > 1 ? "points" : "point"
          } will be expiring on ${updatedPointsExpiryDate.toLocaleDateString()}. Please keep your account active to prevent your points from expiring.`,
        },
        { status: 200 }
      );
    }
    // Return the point balance
    return NextResponse.json(
      {
        point: point.balance,
        message: `${pointsToExpire} ${
          pointsToExpire > 1 ? "points" : "point"
        } will be expiring on ${pointsExpiryDate.toLocaleDateString()}. Please keep your account active to prevent your points from expiring.`,
      },
      { status: 200 }
    );
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
