// app/api/disposal/queue/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Missing token" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decoded === "string") throw new Error("Invalid token");

    const queueId = params.id;

    const disposals = await prisma.disposal.findMany({
      where: {
        queueId,
        isRedeemed: false,
      },
      include: {
        bin: {
          include: {
            binMaterial: true,
          },
        },
      },
    });

    return NextResponse.json(
      disposals.map((d) => ({
        disposalId: d.id,
        material: d.bin.binMaterial.name,
        weightInGrams: d.weightInGrams,
        pointsAwarded: d.pointsAwarded,
        carbonPrint: d.carbonprint,
      })),
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
};
