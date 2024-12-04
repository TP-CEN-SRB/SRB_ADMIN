/*
 * Polling
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import jwt from "jsonwebtoken";

export const PUT = async (
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
    const { disposalId, userId } = await req.json();
    if (userId !== decodedToken.userId) {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { message: "Missing ID parameter" },
        { status: 400 }
      );
    }
    if (!disposalId || !userId) {
      return NextResponse.json(
        {
          message: `Missing fields: ${!disposalId ? "[disposalId]" : ""} ${
            !userId ? "[userId]" : ""
          }`,
        },
        { status: 400 }
      );
    }
    const disposal = await prisma.disposal.findFirst({
      where: { id: disposalId, isRedeemed: false },
    });
    if (!disposal) {
      return NextResponse.json(
        { message: "No disposal found" },
        { status: 404 }
      );
    }
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "STUDENT",
      },
    });
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    const [updatedDisposal, userPoint] = await prisma.$transaction([
      prisma.disposal.update({
        where: { id: disposalId },
        data: {
          userId: userId,
          isRedeemed: true,
        },
      }),
      prisma.point.upsert({
        where: { userId: userId },
        update: { balance: { increment: disposal.pointsAwarded } },
        create: {
          userId,
          balance: disposal.pointsAwarded,
        },
      }),
    ]);
    await pusherServer.trigger(`disposal-qr-${params.id}`, "disposal-update", {
      updated: true,
    });
    return NextResponse.json({ message: "Updated disposal" }, { status: 200 });
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
