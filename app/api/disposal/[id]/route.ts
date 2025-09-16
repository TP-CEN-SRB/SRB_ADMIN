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

    // Fetch with binMaterial
    const disposalsRaw = await prisma.disposal.findMany({
      where: { queueId: queue.id },
      select: {
        id: true,
        weightInGrams: true,
        pointsAwarded: true,
        carbonprint: true,
        isRedeemed: true,
        createdAt: true,
        updatedAt: true,
        bin: {
          select: {
            binMaterial: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Flatten material into top-level field
    const disposals = disposalsRaw.map((d) => ({
      id: d.id,
      weightInGrams: d.weightInGrams,
      pointsAwarded: d.pointsAwarded,
      carbonprint: d.carbonprint,
      isRedeemed: d.isRedeemed,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      material: d.bin?.binMaterial?.name ?? null,
    }));

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
    console.group("[PUT] Debug");

    // Extract token (student scanning) ---
    const token = req.headers.get("Authorization")?.split(" ")[1];
    console.log("Auth header token:", token ? "present" : "missing");
    if (!token) {
      console.groupEnd();
      return NextResponse.json(
        { message: "Missing authorization header!" },
        { status: 401 }
      );
    }

    // --- Verify student JWT ---
    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    console.log("Decoded token payload:", decodedToken);
    if (typeof decodedToken === "string") {
      console.warn("Decoded token is a string → unauthorized");
      console.groupEnd();
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }

    const authUserId = extractUserId(decodedToken);
    console.log("UserId from JWT:", authUserId);
    if (!authUserId) {
      console.warn("No userId in JWT");
      console.groupEnd();
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }
    const userId = authUserId;

    // --- Request body (only disposalToken needed) ---
    const { disposalToken } = await req.json();
    console.log("disposalToken received:", disposalToken ? "present" : "missing");
    if (!disposalToken) {
      console.groupEnd();
      return NextResponse.json(
        { message: "Missing field: [disposalToken]" },
        { status: 400 }
      );
    }

    // --- Verify disposalToken (QR token) ---
    try {
      const decodedDisposalToken = jwt.verify(
        disposalToken,
        process.env.NEXT_JWT_SECRET_KEY!
      );
      console.log("disposalToken verified OK:", decodedDisposalToken);
    } catch (err) {
      console.warn("Invalid disposalToken:", err);
      console.groupEnd();
      return NextResponse.json(
        { message: "Unauthorized disposal token!" },
        { status: 401 }
      );
    }

    // --- Fetch queue ---
    const queueId = params.id;
    console.log("QueueId from params:", queueId);
    const queue = await prisma.disposalQueue.findUnique({
      where: { id: queueId },
      select: { id: true },
    });
    console.log("Queue found:", !!queue);
    if (!queue) {
      console.groupEnd();
      return NextResponse.json(
        { message: "Queue not found" },
        { status: 404 }
      );
    }

    // --- Fetch disposals ---
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
    console.log("Disposals count:", disposals.length);
    if (disposals.length === 0) {
      console.groupEnd();
      return NextResponse.json(
        { message: "No unredeemed disposals in this queue" },
        { status: 404 }
      );
    }

    // --- Aggregate totals ---
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
    console.log("Totals:", { totalPoints, totalCarbon, treeProgressIncrement });

    // --- Transaction ---
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
          description: `Awarded ${totalPoints} pts for ${disposals.length} disposals in queue. (${totalCarbon.toFixed(
            2
          )}g CO2 saved)`,
          transactionType: TransactionType.DISPOSAL,
          userId,
        },
      });
    });
    console.log("Transaction committed");

    // --- Quest updates ---
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
      console.log(`Matching quests for disposal ${d.id}:`, matchingQuests.length);

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

    // --- Notify listeners ---
    await pusherServer.trigger(
      `disposal-qr-${userId}-${queue.id}`, 
      "disposal-update",
      {
        updated: true,
        queueId: queue.id,
        scannedBy: userId,
      }
    );

    console.log("Pusher event sent → disposal-qr-" + userId + "-" + queue.id);

    console.groupEnd();
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
    console.error("[PUT] Error:", error);
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
