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
      const pointsToExpire = Math.ceil(point.balance * 0.2);
      // check if point should expire
      if (new Date() > pointsExpiryDate) {
        const updatedPoint = await prisma.point.update({
          where: { id: point.id },
          data: {
            balance: { decrement: pointsToExpire },
          },
        });
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
