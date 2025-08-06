// app/api/disposal/redeem/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { TransactionType } from "@prisma/client";
import { pusherServer } from "@/lib/pusher";

export const PUT = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Missing token" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decoded === "string") throw new Error("Invalid token");

    const { userId, disposalToken } = await req.json();
    if (!userId || !disposalToken) {
      return NextResponse.json({ message: "Missing userId or disposalToken" }, { status: 400 });
    }

    if (userId !== decoded.userId) {
      return NextResponse.json({ message: "Unauthorized user" }, { status: 401 });
    }

    const decodedDisposalToken = jwt.verify(disposalToken, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decodedDisposalToken === "string") throw new Error("Invalid token");

    const queueId = decodedDisposalToken.queueId;
    const managerId = decodedDisposalToken.userId;

    const disposals = await prisma.disposal.findMany({
      where: { queueId, isRedeemed: false },
      include: {
        bin: {
          include: {
            binMaterial: true,
          },
        },
      },
    });

    if (!disposals.length) {
      return NextResponse.json({ message: "No disposals to redeem" }, { status: 404 });
    }

    const student = await prisma.user.findUnique({ where: { id: userId } });
    if (!student || student.role !== "STUDENT") {
      return NextResponse.json({ message: "Invalid student" }, { status: 404 });
    }

    let totalPoints = 0;
    let totalCarbon = 0;

    const updates = disposals.map((d) => {
      const emissionFactor = d.bin.binMaterial.carbon_multiplier ?? 0;
      const carbon = d.weightInGrams * emissionFactor;
      totalPoints += d.pointsAwarded;
      totalCarbon += carbon;

      return prisma.disposal.update({
        where: { id: d.id },
        data: {
          userId,
          isRedeemed: true,
          carbonprint: carbon,
        },
      });
    });

    const treeProgressGained = totalCarbon / 1000;

    await prisma.$transaction([
      ...updates,
      prisma.point.upsert({
        where: { userId },
        update: { balance: { increment: totalPoints } },
        create: { userId, balance: totalPoints },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          carbonprint: { increment: totalCarbon },
          treeprogress: { increment: treeProgressGained },
        },
      }),
      prisma.transaction.create({
        data: {
          pointsChange: totalPoints,
          description: `Awarded ${totalPoints} pts for redeeming ${disposals.length} disposals (${totalCarbon.toFixed(2)}g CO2 saved)`,
          transactionType: TransactionType.DISPOSAL,
          userId,
        },
      }),
    ]);

    // Update points in event if ongoing
    const now = new Date();
    const activeEvent = await prisma.userEvent.findFirst({
      where: {
        userId,
        event: {
          startDate: { lte: now },
          endDate: { gte: now },
        },
      },
    });

    if (activeEvent) {
      await prisma.userEvent.update({
        where: { id: activeEvent.id },
        data: {
          points: { increment: totalPoints },
        },
      });
    }

    await pusherServer.trigger(`disposal-qr-${managerId}`, "disposal-update", {
      updated: true,
    });

    return NextResponse.json({
      message: "Disposals redeemed",
      totalPoints,
      totalCarbon: totalCarbon.toFixed(2),
      treeProgressGained: treeProgressGained.toFixed(2),
    });
  } catch (error) {
    return NextResponse.json({ message: "Redemption failed", error: (error as Error).message }, { status: 500 });
  }
};
