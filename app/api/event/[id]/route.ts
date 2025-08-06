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
      return NextResponse.json({ message: "Missing authorization header!" }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decodedToken === "string") {
      return NextResponse.json({ message: "Unauthorized access!" }, { status: 401 });
    }

    const decodedUserId = (decodedToken as { userId: string }).userId;
    const requestedUserId = params.id;

    if (decodedUserId !== requestedUserId) {
      return NextResponse.json({ message: "Unauthorized access to another user's data!" }, { status: 403 });
    }

    const userEvents = await prisma.userEvent.findMany({
      where: { userId: requestedUserId },
      select: {
        id: true,
        eventId: true,
        event: {
          select: {
            title: true,
            description: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: { event: { startDate: "desc" } },
    });

    if (userEvents.length === 0) {
      return NextResponse.json({ message: "No events found for this user!" }, { status: 404 });
    }

    const eventsWithPoints = await Promise.all(
      userEvents.map(async (userEvent) => {
        const totalPoints = await prisma.disposal.aggregate({
          _sum: {
            pointsAwarded: true,
          },
          where: {
            userId: requestedUserId,
            createdAt: {
              gte: userEvent.event.startDate,
              lte: userEvent.event.endDate,
            },
          },
        });

        return {
          id: userEvent.id,
          points: totalPoints._sum.pointsAwarded ?? 0,
          eventId: userEvent.eventId,
          event: {
            title: userEvent.event.title,
            description: userEvent.event.description,
            startDate: userEvent.event.startDate,
            endDate: userEvent.event.endDate,
          },
        };
      })
    );

    return NextResponse.json({ events: eventsWithPoints }, { status: 200 });

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
