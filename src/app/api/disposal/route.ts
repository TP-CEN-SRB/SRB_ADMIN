import { NextRequest, NextResponse } from "next/server";
import { DisposalSchema } from "@/schemas";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

type Body = {
  userId: string;
  material: string;
  weightInGrams: number;
  queueId?: string;
};

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

// sent by locally hosted bin
export const POST = async (req: NextRequest) => {
  try {
    // Auth
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

    // Body
    const raw = await req.json();
    const userId: string = raw.userId;

    // Normalize to items[]
    type Item = { material: string; weightInGrams: number };
    const items: Item[] =
      Array.isArray(raw.items) && raw.items.length > 0
        ? raw.items
        : [{ material: raw.material, weightInGrams: raw.weightInGrams }];

    // Validate each item
    for (const it of items) {
      const validated = DisposalSchema.safeParse(it);
      if (!validated.success) {
        return NextResponse.json({ message: "Invalid fields!" }, { status: 400 });
      }
    }

    // Transaction: create one or many disposals
    const { ids, points, carbonprints } = await prisma.$transaction(async (tx) => {
      const ids: string[] = [];
      const points: number[] = [];
      const carbonprints: number[] = [];

      for (const { material: mRaw, weightInGrams } of items) {
        const material = (mRaw ?? "").toUpperCase();

        const [bin, binMaterial] = await Promise.all([
          tx.bin.findFirst({
            where: {
              userId,
              binMaterial: { name: material },
            },
            select: {
              id: true,
              status: true,
              currentCapacity: true,
              binMaterial: { select: { name: true } },
            },
          }),
          tx.binMaterial.findUnique({
            where: { name: material },
          }),
        ]);

        if (!bin) throw new Error("No bin found!");
        if (!binMaterial) throw new Error("No bin material found!");
        if (bin.status === "UNDER_MAINTENANCE") {
          throw new Error("Bin is currently under maintenance!");
        }
        if (bin.currentCapacity >= 100) {
          throw new Error("Bin is already full!");
        }

        const carbonPrint =
          weightInGrams * (binMaterial.carbon_multiplier ?? 0);
        const pointsAwarded = Math.floor(
          weightInGrams * (binMaterial.multiplier ?? 1)
        );

        const disposal = await tx.disposal.create({
          data: {
            weightInGrams,
            binId: bin.id,
            carbonprint: carbonPrint,
            pointsAwarded,
          },
          select: { id: true, pointsAwarded: true, carbonprint: true },
        });

        ids.push(disposal.id);
        points.push(disposal.pointsAwarded);
        carbonprints.push(disposal.carbonprint);
      }

      return { ids, points, carbonprints };
    });

    // Response
    if (ids.length === 1) {
      return NextResponse.json(
        {
          id: ids[0],
          point: points[0],
          carbonprint: carbonprints[0],
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        ids,
        points,
        carbonprints,
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
