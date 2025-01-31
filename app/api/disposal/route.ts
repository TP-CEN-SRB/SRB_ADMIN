import { NextRequest, NextResponse } from "next/server";
import { DisposalSchema } from "@/schemas";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

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
    const { userId, material, weightInGrams } = await req.json();

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
    const [bin, binMaterial] = await Promise.all([
      prisma.bin.findFirst({
        where: {
          binMaterial: {
            name: material.toUpperCase(),
          },
          userId,
        },
        select: {
          id: true,
          status: true,
          currentCapacity: true,
          user: { select: { location: true, faculty: true } },
          binMaterial: { select: { name: true } },
        },
      }),
      prisma.binMaterial.findUnique({
        where: { name: material.toUpperCase() },
      }),
    ]);
    if (!bin)
      return NextResponse.json(
        {
          message: "No bin found!",
        },
        { status: 404 }
      );
    if (!binMaterial) {
      return NextResponse.json(
        { message: "No bin material found!" },
        { status: 404 }
      );
    }
    if (bin.status === "UNDER_MAINTENANCE") {
      return NextResponse.json(
        {
          message: "Bin is current under maintenance!",
        },
        { status: 400 }
      );
    }
    if (bin.currentCapacity === 100) {
      return NextResponse.json(
        {
          message: "Bin is already full!",
        },
        { status: 400 }
      );
    }
    const disposal = await prisma.disposal.create({
      data: {
        weightInGrams: weightInGrams,
        binId: bin.id,
        pointsAwarded: Math.floor(weightInGrams * binMaterial.multiplier), // rounds down the points awarded - weight*multiplier
      },
    });
    return NextResponse.json(
      {
        id: disposal.id,
        point: disposal.pointsAwarded,
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
