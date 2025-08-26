import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";
import { TransactionType } from "@prisma/client";
import { pusherServer } from "@/lib/pusher";

// retrieve by disposalId (legacy) OR by queueId (new)
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

    const id = params.id;

    // 1) Try disposal by id (legacy path)
    const disposal = await prisma.disposal.findUnique({
      where: { id },
      include: {
        bin: { include: { binMaterial: true } },
      },
    });
    if (disposal) {
      return NextResponse.json({ disposal }, { status: 200 });
    }

    // 2) If not a disposal, try queue by id (new path)
    const queue = await prisma.disposalQueue.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!queue) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const disposals = await prisma.disposal.findMany({
      where: { queueId: queue.id },
      include: {
        bin: { include: { binMaterial: true } },
      },
      orderBy: { createdAt: "asc" }, // optional
    });

    return NextResponse.json({ queueId: queue.id, disposals }, { status: 200 });
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

    const id = params.id;
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

    if (userId !== (decodedToken as any).userId) {
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

    const binManagerId = (decodedDisposalToken as any).userId;
    const binManager = await prisma.user.findUnique({
      where: { id: binManagerId },
    });
    if (!binManager) {
      return NextResponse.json(
        { message: "Bin manager not found!" },
        { status: 404 }
      );
    }

    /**
     * Decide mode:
     * - Legacy single: id is a disposalId
     * - Queue mode:   id is a queueId
     */
    const maybeDisposal = await prisma.disposal.findFirst({
      where: { id, isRedeemed: false },
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
    });

    // ===== Legacy single disposal (UNCHANGED behavior) =====
    if (maybeDisposal) {
      const disposal = maybeDisposal;

      const emissionFactor = disposal.bin.binMaterial.carbon_multiplier ?? 0;
      const carbonPrint = disposal.weightInGrams * emissionFactor;
      const treeProgressIncrement = carbonPrint / 1000;

      const [updatedDisposal, userPoint, updatedUser] = await prisma.$transaction([
        prisma.disposal.update({
          where: { id },
          data: {
            userId,
            isRedeemed: true,
            carbonprint: carbonPrint,
          },
        }),
        prisma.point.upsert({
          where: { userId },
          update: { balance: { increment: disposal.pointsAwarded } },
          create: { userId, balance: disposal.pointsAwarded },
        }),
        prisma.user.update({
          where: { id: userId },
          data: {
            carbonprint: { increment: carbonPrint },
            treeprogress: { increment: treeProgressIncrement },
          },
        }),
      ]);

      await prisma.transaction.create({
        data: {
          pointsChange: disposal.pointsAwarded,
          description: `Awarded ${disposal.pointsAwarded} pts for recycling ${disposal.weightInGrams}g of ${disposal.bin.binMaterial.name.toLowerCase()} (${carbonPrint.toFixed(
            2
          )}g CO2 saved)`,
          transactionType: TransactionType.DISPOSAL,
          userId,
        },
      });

      await pusherServer.trigger(`disposal-qr-${binManagerId}`, "disposal-update", {
        updated: true,
      });

      // Active event points (single)
      const now = new Date();
      const activeEvent = await prisma.userEvent.findFirst({
        where: {
          userId,
          event: { startDate: { lte: now }, endDate: { gte: now } },
        },
        select: { id: true },
      });
      if (activeEvent) {
        await prisma.userEvent.update({
          where: { id: activeEvent.id },
          data: { points: { increment: disposal.pointsAwarded } },
        });
      }

      // Quests (single)
      const matchingQuests = await prisma.userQuest.findMany({
        where: {
          userId,
          isCompleted: false,
          quest: {
            startDate: { lte: now },
            endDate: { gte: now },
            materialType: disposal.bin.binMaterial.name.toUpperCase(),
          },
        },
        include: { quest: { select: { target: true } } },
      });

      for (const uq of matchingQuests) {
        const target = uq.quest.target ?? 0;
        const achievedBefore = target > 0 ? uq.progress * target : 0;
        const achievedAfter = achievedBefore + disposal.weightInGrams;
        const fraction = target > 0 ? Math.min(1.0, achievedAfter / target) : 1.0;
        await prisma.userQuest.update({
          where: { id: uq.id },
          data: { progress: fraction },
        });
      }

      return NextResponse.json(
        {
          message: "Updated disposal",
          carbonPrint: carbonPrint.toFixed(2),
          treeProgressGained: treeProgressIncrement.toFixed(2),
        },
        { status: 200 }
      );
    }

    // ===== Queue mode (NEW): id is queueId, redeem all unredeemed disposals in this queue =====
    const queue = await prisma.disposalQueue.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!queue) {
      return NextResponse.json({ message: "No disposal or queue found" }, { status: 404 });
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
      return NextResponse.json({ message: "No unredeemed disposals in this queue" }, { status: 404 });
    }

    // Aggregate
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

    // Transactional updates for ALL items in the queue
    await prisma.$transaction(async (tx) => {
      // mark each disposal redeemed + set user + carbon
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

      // points balance
      await tx.point.upsert({
        where: { userId },
        update: { balance: { increment: totalPoints } },
        create: { userId, balance: totalPoints },
      });

      // user carbon + tree
      await tx.user.update({
        where: { id: userId },
        data: {
          carbonprint: { increment: totalCarbon },
          treeprogress: { increment: treeProgressIncrement },
        },
      });

      // single summary transaction (you can also create one per disposal if you prefer)
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

    // Active event points (sum)
    const now = new Date();
    const activeEvent = await prisma.userEvent.findFirst({
      where: {
        userId,
        event: { startDate: { lte: now }, endDate: { gte: now } },
      },
      select: { id: true },
    });
    if (activeEvent) {
      await prisma.userEvent.update({
        where: { id: activeEvent.id },
        data: { points: { increment: totalPoints } },
      });
    }

    // Quests: update per disposal/material
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
        const fraction = target > 0 ? Math.min(1.0, achievedAfter / target) : 1.0;
        await prisma.userQuest.update({
          where: { id: uq.id },
          data: { progress: fraction },
        });
      }
    }

    // Notify kiosk (include queueId so listener can filter)
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
