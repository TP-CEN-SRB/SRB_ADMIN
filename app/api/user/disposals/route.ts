import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

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

    const userId = decodedToken.userId;
    const date = new Date();
    const last = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    const first = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 30, 0, 0, 0, 0);
    const usersPast30DaysDisposals = await prisma.disposal.findMany({
      where: {
        userId,
        createdAt: {
          gte: first,
          lte: last,
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    const days = [];
    for (let i = 30; i > 0; i--) {
      const day = new Date(last);
      day.setDate(date.getDate() - i); // Subtract i days from today
      days.push(day);
    }
    const disposalsDaily: number[] = [];
    days.map((day) => {
      const disposals = usersPast30DaysDisposals.filter((disposal) => {
        return disposal.createdAt.toDateString() === day.toDateString();
      });
      disposalsDaily.push(disposals.length);
    });

    return NextResponse.json(
      days.map((day, index) => {
        return { day, disposals: disposalsDaily[index] };
      }),
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
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
