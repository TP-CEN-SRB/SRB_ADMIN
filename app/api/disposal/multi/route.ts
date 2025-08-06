import { NextRequest, NextResponse } from "next/server";
import { DisposalSchema } from "@/schemas";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ message: "Missing authorization header!" }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decodedToken === "string") {
      return NextResponse.json({ message: "Unauthorized access!" }, { status: 401 });
    }

    const {
      userId,
      disposals,
    }: { userId: string; disposals: { material: string; weightInGrams: number }[] } = await req.json();

    if (!userId || !Array.isArray(disposals) || disposals.length === 0) {
      return NextResponse.json({ message: "Missing or invalid disposal payload!" }, { status: 400 });
    }

    // ✅ Step 1: Create a DisposalQueue
    const queue = await prisma.disposalQueue.create({ data: {} });

    const allResults = [];
    let totalPoints = 0;
    let totalCarbon = 0;

    for (const disposalEntry of disposals) {
      const { material, weightInGrams } = disposalEntry;

      const validated = DisposalSchema.safeParse({ material, weightInGrams });
      if (!validated.success) {
        return NextResponse.json({ message: `Invalid disposal entry: ${material}` }, { status: 400 });
      }

      const [bin, binMaterial] = await Promise.all([
        prisma.bin.findFirst({
          where: {
            binMaterial: { name: material.toUpperCase() },
            userId,
          },
          select: {
            id: true,
            status: true,
            currentCapacity: true,
            binMaterial: { select: { name: true } },
          },
        }),
        prisma.binMaterial.findUnique({
          where: { name: material.toUpperCase() },
        }),
      ]);

      if (!bin) {
        return NextResponse.json({ message: `No bin found for ${material}` }, { status: 404 });
      }
      if (!binMaterial) {
        return NextResponse.json({ message: `No bin material found for ${material}` }, { status: 404 });
      }
      if (bin.status === "UNDER_MAINTENANCE") {
        return NextResponse.json({ message: `Bin for ${material} is under maintenance!` }, { status: 400 });
      }
      if (bin.currentCapacity === 100) {
        return NextResponse.json({ message: `Bin for ${material} is already full!` }, { status: 400 });
      }

      const carbonPrint = weightInGrams * (binMaterial.carbon_multiplier ?? 0);
      const pointsAwarded = Math.floor(weightInGrams * binMaterial.multiplier);

      const disposal = await prisma.disposal.create({
        data: {
          weightInGrams,
          binId: bin.id,
          carbonprint: carbonPrint,
          pointsAwarded,
          queueId: queue.id,
          userId,
        },
      });

      totalPoints += pointsAwarded;
      totalCarbon += carbonPrint;

      allResults.push({
        id: disposal.id,
        material: binMaterial.name,
        point: pointsAwarded,
        carbonprint: carbonPrint,
      });
    }

    return NextResponse.json(
      {
        message: "Multi-disposal recorded",
        queueId: queue.id,
        totalDisposals: allResults.length,
        totalPoints,
        totalCarbonprint: totalCarbon.toFixed(2),
        records: allResults,
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
