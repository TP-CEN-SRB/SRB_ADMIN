import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * Exipire user's points if they have been inactive (Points not updated for 3 months)
 * Scheduled to run every day at 23:59 UTC
 */
export const PUT = async (req: NextRequest) => {
  try {
    const authorization = req.headers.get("x-api-key");
    if (authorization !== process.env.API_KEY) {
      return NextResponse.json(
        { message: "Permission denied!" },
        { status: 401 }
      );
    }
    const today = new Date();
    const points = await prisma.point.findMany();
    if (!points || points.length === 0) {
      return NextResponse.json({ message: "No points found" }, { status: 404 });
    }

    // only retrieve the points that needs to be expired
    const filteredPoints = points.filter((point) => {
      const pointsExpiryDate = new Date(point.updatedAt);
      pointsExpiryDate.setMonth(pointsExpiryDate.getMonth() + 3);
      return today > pointsExpiryDate;
    });
    if (!filteredPoints.length) {
      return NextResponse.json(
        { message: "No points are expired" },
        { status: 200 }
      );
    }
    // use a db transaction to execute 1 database call
    await prisma.$transaction(
      filteredPoints
        .map((point) => [
          prisma.point.update({
            where: { id: point.id },
            data: {
              balance: { decrement: Math.ceil(point.balance * 0.2) },
            },
          }),
          prisma.transaction.create({
            data: {
              pointsChange: -Math.ceil(point.balance * 0.2),
              description: `Expired ${Math.ceil(
                point.balance * 0.2
              )} pts for being inactive from ${point.updatedAt.toLocaleString(
                "default",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }
              )} to ${today.toLocaleString("default", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}`,
              transactionType: "OTHERS",
              userId: point.userId,
            },
          }),
        ])
        .flat()
    );
    return NextResponse.json(
      { message: "Points expired successfully" },
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
