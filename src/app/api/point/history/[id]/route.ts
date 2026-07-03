import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params; 

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

    const userId = id;

    // Check if the token's userId matches the requested userId
    if (decodedToken.userId !== userId) {
      return NextResponse.json(
        { message: "Unauthorized access" },
        { status: 401 }
      );
    }
    const transactions = await prisma.transaction.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        pointsChange: true,
        description: true,
        transactionType: true,
        createdAt: true,
      },
    });
    const formatDate = (date: string | number | Date) =>
      new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(date));

    const formattedTransactions = transactions.map((transaction) => ({
      ...transaction,
      createdAt: formatDate(transaction.createdAt),
    }));
    return NextResponse.json(
      { history: formattedTransactions },
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
    } else if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    // Handle any other unknown errors
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
