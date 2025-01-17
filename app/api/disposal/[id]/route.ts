import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import jwt from "jsonwebtoken";
import { TransactionType } from "@prisma/client";

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
    const id = params.id;
    const binManager = await prisma.user.findUnique({ where: { id: id } });
    if (!binManager) {
      return NextResponse.json(
        { message: "Bin manager not found!" },
        { status: 404 }
      );
    }
    const { disposalId, userId } = await req.json();
    if (userId !== decodedToken.userId) {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
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
      select: {
        id: true,
        pointsAwarded: true,
        weightInGrams: true,
        bin: {
          include: {
            binMaterial: true,
          },
        },
      },
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
    } // use a transaction to ensure that the points are awarded to user and the QR cannot be scanned again
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
    // create a transaction if user is rewarded with points
    if (updatedDisposal) {
      await prisma.transaction.create({
        data: {
          pointsChange: disposal.pointsAwarded,
          description: `Awarded ${disposal.pointsAwarded} pts for recycling ${
            disposal.weightInGrams
          }g of ${disposal.bin.binMaterial.name.toLowerCase()}`,
          transactionType: TransactionType.DISPOSAL,
          userId: userId,
        },
      });
    }
    await pusherServer.trigger(`disposal-qr-${id}`, "disposal-update", {
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
