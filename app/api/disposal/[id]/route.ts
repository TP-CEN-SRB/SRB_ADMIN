import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";
import { TransactionType } from "@prisma/client";
import { pusherServer } from "@/lib/pusher";

// retrieve the disposal
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
    const disposalId = params.id;
    const disposal = await prisma.disposal.findUnique({
      where: {
        id: disposalId,
      },
      include: {
        bin: {
          include: {
            binMaterial: true,
          },
        },
      },
    });
    return NextResponse.json({ disposal }, { status: 200 });
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

    const disposalId = params.id;
    const { userId, disposalToken } = await req.json();
    if (!userId || !disposalToken) {
      return NextResponse.json(
        {
          message: `Missing fields: ${!userId ? "[userId]" : ""} ${
            !disposalToken ? "[disposalToken]" : ""
          }`,
        },
        { status: 400 }
      );
    }

    if (userId !== decodedToken.userId) {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }

    const decodedDisposalToken = jwt.verify(
      disposalToken,
      process.env.NEXT_JWT_SECRET_KEY!
    );
    if (typeof decodedDisposalToken === "string") {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }

    const binManagerId = decodedDisposalToken.userId;
    const binManager = await prisma.user.findUnique({
      where: { id: binManagerId },
    });
    if (!binManager) {
      return NextResponse.json(
        { message: "Bin manager not found!" },
        { status: 404 }
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
            binMaterial: {
              select: {
                name: true,
                carbon_multiplier: true,
              },
            },
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
      where: { id: userId, role: "STUDENT" },
    });

    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 🌱 Calculate carbonPrint using carbon_multiplier

    const TREE_COMPLETION_UNIT = 1000;
    const emissionFactor = disposal.bin.binMaterial.carbon_multiplier ?? 0;
    const carbonPrint = disposal.weightInGrams * emissionFactor;
    const treeProgressIncrement = (carbonPrint / TREE_COMPLETION_UNIT) * 100;

    // 🧾 Transactional updates
    const [updatedDisposal, userPoint, updatedUser] = await prisma.$transaction([
      prisma.disposal.update({
        where: { id: disposalId },
        data: {
          userId,
          isRedeemed: true,
          carbonprint: carbonPrint,
        },
      }),
      prisma.point.upsert({
        where: { userId },
        update: { balance: { increment: disposal.pointsAwarded } },
        create: {
          userId,
          balance: disposal.pointsAwarded,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          carbonprint: {
            increment: carbonPrint,
          },
          treeprogress: {
            increment: treeProgressIncrement,
          },
        },
      }),
    ]);

    await prisma.transaction.create({
      data: {
        pointsChange: disposal.pointsAwarded,
        description: `Awarded ${disposal.pointsAwarded} pts for recycling ${disposal.weightInGrams}g of ${disposal.bin.binMaterial.name.toLowerCase()} (${carbonPrint.toFixed(2)}kg CO₂ saved)`,
        transactionType: TransactionType.DISPOSAL,
        userId,
      },
    });

    await pusherServer.trigger(`disposal-qr-${binManagerId}`, "disposal-update", {
      updated: true,
    });

    return NextResponse.json(
      {
        message: "Updated disposal",
        carbonPrint: carbonPrint.toFixed(2),
        treeProgressGained: treeProgressIncrement.toFixed(2),
      },
      { status: 200 }
    );
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
