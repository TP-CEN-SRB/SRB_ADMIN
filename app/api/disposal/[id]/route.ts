import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";
import { TransactionType } from "@prisma/client";
import { pusherServer } from "@/lib/pusher";

// Safely extract userId from a decoded JWT without using `any`
const extractUserId = (decoded: unknown): string | null => {
  if (typeof decoded !== "object" || decoded === null) return null;
  const uid = (decoded as Record<string, unknown>).userId;
  return typeof uid === "string" ? uid : null;
};

// ✅ Only queue mode now
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

    const queue = await prisma.disposalQueue.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!queue) {
      return NextResponse.json({ message: "Queue not found" }, { status: 404 });
    }

    const disposals = await prisma.disposal.findMany({
      where: { queueId: queue.id },
      include: {
        bin: {
          include: { binMaterial: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(
      { queueId: queue.id, disposals },
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

    const authUserId = extractUserId(decodedToken);
    if (!authUserId) {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }

    // request body
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

    // user making the request must match JWT user
    if (userId !== authUserId) {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }

    // verify disposalToken (issued by bin manager)
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
    const binManagerId = extractUserId(decodedDisposalToken);
    if (!binManagerId) {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }

    const binManager = await prisma.user.findUnique({
      where: { id: binManagerId },
    });
    if (!binManager) {
      return NextResponse.json(
        { message: "Bin manager not found!" },
        { status: 404 }
      );
    }

    // --- Always queue mode ---
    const queueId = params.id;
    const queue = await prisma.disposalQueue.findUnique({
      where: { id: queueId },
      select: { id: true },
    });
    if (!queue) {
      return NextResponse.json(
        { message: "Queue not found" },
        { status: 404 }
      );
    }

    const disposals = await prisma.disposal.findMany({
      where: { queueId: queue.id, isRedeemed: false },
      select: {
        id: true,
        pointsAwarded: true,
        weightInGrams: true,
        bin: {
          include: {
            binMaterial: {
              select: { name: true, carbon_multiplier: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (disposals.length === 0) {
      return NextResponse.json(
        { message: "No unredeemed disposals in this queue" },
        { status: 404 }
      );
    }

    // aggregate totals
    let totalPoints = 0;
    let totalCarbon = 0;
    const carbonById: Record<string, number> = {};

    for (const d of disposals) {
      const emissionFactor = d.bin.binMaterial.carbon_multiplier ?? 0;
      const c = d.weightInGrams * emissionFactor;
      carbonById[d.id] = c;
      totalCarbon += c;
      totalPoints += d.pointsAwarded;
    }
    const treeProgressIncrement = totalCarbon / 1000;

    // transaction: mark disposals redeemed + update user + transaction
    await prisma.$transaction(async (tx) => {
      for (const d of disposals) {
        await tx.disposal.update({
          where: { id: d.id },
          data: {
            userId,
            isRedeemed: true,
            carbonprint: carbonById[d.id],
          },
        });
      }

      await tx.point.upsert({
        where: { userId },
        update: { balance: { increment: totalPoints } },
        create: { userId, balance: totalPoints },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          carbonprint: { increment: totalCarbon },
          treeprogress: { increment: treeProgressIncrement },
        },
      });

      await tx.transaction.create({
        data: {
          pointsChange: totalPoints,
          description: `Awarded ${totalPoints} pts for ${disposals.length} disposals in queue ${queue.id} (${totalCarbon.toFixed(
            2
          )}g CO2 saved)`,
          transactionType: TransactionType.DISPOSAL,
          userId,
        },
      });
    });

    // quests: update based on each disposal
    const now = new Date();
    for (const d of disposals) {
      const matchingQuests = await prisma.userQuest.findMany({
        where: {
          userId,
          isCompleted: false,
          quest: {
            startDate: { lte: now },
            endDate: { gte: now },
            materialType: d.bin.binMaterial.name.toUpperCase(),
          },
        },
        include: { quest: { select: { target: true } } },
      });

      for (const uq of matchingQuests) {
        const target = uq.quest.target ?? 0;
        const achievedBefore = target > 0 ? uq.progress * target : 0;
        const achievedAfter = achievedBefore + d.weightInGrams;
        const fraction =
          target > 0 ? Math.min(1.0, achievedAfter / target) : 1.0;
        await prisma.userQuest.update({
          where: { id: uq.id },
          data: { progress: fraction },
        });
      }
    }

    // notify kiosk / listener
    await pusherServer.trigger(`disposal-qr-${binManagerId}`, "disposal-update", {
      updated: true,
      queueId: queue.id,
    });

    return NextResponse.json(
      {
        message: "Updated queue",
        queueId: queue.id,
        totalPoints,
        totalCarbon: totalCarbon.toFixed(2),
        treeProgressGained: treeProgressIncrement.toFixed(2),
        count: disposals.length,
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
