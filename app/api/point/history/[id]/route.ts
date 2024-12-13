import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    // Extract the JWT token from the Authorization header
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Missing authorization header!" },
        { status: 401 }
      );
    }

    // Verify the JWT token
    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decodedToken === "string") {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }

    const userId = params.id;

    // Check if the token's userId matches the requested userId
    if (decodedToken.userId !== userId) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Fetch the disposal history
    const disposals = await prisma.disposal.findMany({
      where: { userId },
      select: {
        id: true,
        pointsAwarded: true,
        weightInGrams: true,
        createdAt: true,
      },
    });

    // Fetch the redemption history with associated reward details
    const redemptions = await prisma.redemption.findMany({
      where: { userId },
      include: {
        reward: {
          select: {
            name: true,
            pointsRequired: true,
            description: true,
            image: true,
          },
        },
      },
    });

    const formatDate = (date: string | number | Date) =>
      new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));

    const disposalHistory = disposals.map((disposal) => ({
      id: disposal.id,
      type: "DISPOSAL",
      points: disposal.pointsAwarded,
      description: `Points awarded for disposal (${disposal.weightInGrams} grams)`,
      date: formatDate(disposal.createdAt), // Updated format
    }));

    const redemptionHistory = redemptions.map((redemption) => ({
      id: redemption.id,
      type: "REDEMPTION",
      points: -redemption.reward.pointsRequired,
      description: redemption.reward.name,
      date: formatDate(redemption.createdAt), // Updated format
      reward: {
        name: redemption.reward.name,
        description: redemption.reward.description,
        image: redemption.reward.image,
      },
    }));

    // Combine disposal and redemption history
    const combinedHistory = [...disposalHistory, ...redemptionHistory];

    // Group the history by date
    const groupedHistory = combinedHistory.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return acc;
    }, {} as Record<string, typeof combinedHistory>);

    // Return the grouped history as an array of objects
    const groupedHistoryArray = Object.keys(groupedHistory).map((date) => ({
      date,
      entries: groupedHistory[date],
    }));

    // Sort the grouped history by date (descending)
    groupedHistoryArray.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ history: groupedHistoryArray }, { status: 200 });
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

    // Handle any other unknown errors
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
