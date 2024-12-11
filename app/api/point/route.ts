import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
// cron job to check if points have expired
export const PUT = async (req: NextRequest) => {
  try {
    const authorization = req.headers.get("x-api-key");
    if (authorization !== process.env.API_KEY) {
      return NextResponse.json(
        { message: "Permission denied!" },
        { status: 401 }
      );
    }
    const points = await prisma.point.findMany();

    if (!points || points.length === 0) {
      return NextResponse.json({ message: "No points found" }, { status: 404 });
    }
    for (const point of points) {
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
        updatedPointsExpiryDate.setMonth(
          updatedPointsExpiryDate.getMonth() + 3
        );
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
    }

    // Return the point balance
    return NextResponse.json(
      { message: "Cron Job performed successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
