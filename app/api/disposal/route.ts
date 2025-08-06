import { NextRequest, NextResponse } from "next/server";
import { DisposalSchema } from "@/schemas";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

export const GET = async (req: NextRequest) => {
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
    const bins = await prisma.bin.findMany({
      where: { userId: decodedToken.userId },
      select: {
        _count: { select: { disposals: true } },
        binMaterial: { select: { name: true } },
      },
    });
    if (bins.length === 0) {
      return NextResponse.json({ message: "No bins found!" });
    }
    const disposals = bins.map((bin) => ({
      material: bin.binMaterial.name,
      count: bin._count.disposals,
    }));
    if (disposals.length === 0) {
      return NextResponse.json({ message: "No disposals found!" });
    }
    return NextResponse.json({ disposals }, { status: 200 });
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

    const { userId, material, weightInGrams } = await req.json();

    const validatedFields = DisposalSchema.safeParse({ material, weightInGrams });
    if (!validatedFields.success) {
      return NextResponse.json({ message: "Invalid fields!" }, { status: 400 });
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

    if (!bin) return NextResponse.json({ message: "No bin found!" }, { status: 404 });
    if (!binMaterial) return NextResponse.json({ message: "No bin material found!" }, { status: 404 });
    if (bin.status === "UNDER_MAINTENANCE") return NextResponse.json({ message: "Bin is under maintenance!" }, { status: 400 });
    if (bin.currentCapacity === 100) return NextResponse.json({ message: "Bin is already full!" }, { status: 400 });

    // ✅ Create a new disposal queue
    const queue = await prisma.disposalQueue.create({ data: {} });

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

    return NextResponse.json(
      {
        id: disposal.id,
        point: disposal.pointsAwarded,
        carbonprint: carbonPrint,
        queueId: queue.id, // ✅ Included for QR/summary flow
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