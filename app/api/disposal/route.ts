import { NextRequest, NextResponse } from "next/server";
import { DisposalSchema } from "@/schemas";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { TransactionType } from "@prisma/client";
import { pusherServer } from "@/lib/pusher";

// sent by locally hosted bin
export const POST = async (req: NextRequest) => {
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
    const { id, material, weightInGrams } = await req.json();

    const validatedFields = DisposalSchema.safeParse({
      material,
      weightInGrams,
    });
    if (!validatedFields.success) {
      return NextResponse.json(
        {
          message: "Invalid fields!",
        },
        { status: 400 }
      );
    }
    const bin = await prisma.bin.findFirst({
      where: {
        binMaterial: {
          name: material.toUpperCase(),
        },
        userId: id,
      },
      select: {
        id: true,
        status: true,
        currentCapacity: true,
        user: { select: { location: true, faculty: true } },
        binMaterial: { select: { name: true } },
      },
    });
    if (!bin) return { error: "No bin found" };
    if (bin.status === "UNDER_MAINTENANCE") {
      return { error: "Bin is currently under maintenance" };
    }
    if (bin.currentCapacity === 100) {
      return { error: "Bin is already full!" };
    }
    const disposal = await prisma.disposal.create({
      data: {
        weightInGrams: weightInGrams,
        binId: bin.id,
        pointsAwarded: weightInGrams, // 1g = 1 point
      },
    });
    return NextResponse.json(
      {
        id: disposal.id,
      },
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

export const PUT = async (req: NextRequest) => {
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
    const { disposalId, userId, id } = await req.json();
    const binManager = await prisma.user.findUnique({ where: { id: id } });
    if (!binManager) {
      return NextResponse.json(
        { message: "Bin manager not found!" },
        { status: 404 }
      );
    }
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
    } else if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
