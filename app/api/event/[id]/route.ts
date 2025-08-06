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

    const decodedUserId = (decodedToken as { userId: string }).userId;
    const requestedUserId = params.id;

    if (decodedUserId !== requestedUserId) {
      return NextResponse.json(
        { message: "Unauthorized access to another user's data!" },
        { status: 403 }
      );
    }

    const events = await prisma.event.findMany({
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        startDate: true,
        endDate: true,
      },
    });

    if (!events || events.length === 0) {
      return NextResponse.json({ message: "No events found!" }, { status: 404 });
    }

    const results = await Promise.all(
      events.map(async (event) => {
        const totalPoints = await prisma.disposal.aggregate({
          _sum: {
            pointsAwarded: true,
          },
          where: {
            userId: requestedUserId,
            createdAt: {
              gte: event.startDate,
              lte: event.endDate,
            },
          },
        });

        return {
          eventId: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          usersPoints: totalPoints._sum.pointsAwarded ?? 0,
        };
      })
    );

    return NextResponse.json({ events: results }, { status: 200 });

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
