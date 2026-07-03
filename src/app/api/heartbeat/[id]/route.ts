// app/api/heartbeat/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { BinStatus } from "@/generated/prisma";
import { redis } from "@/lib/redis";

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params; 

    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ message: "Permission denied" }, { status: 401 });
    }

    const userId = id;
    const { material } = await req.json();
    if (!material) {
      return NextResponse.json({ message: "Missing material" }, { status: 400 });
    }

    const bin = await prisma.bin.findFirst({
      where: {
        userId,
        binMaterial: {
          name: { equals: material, mode: "insensitive" },
        },
      },
    });

    if (!bin) {
      return NextResponse.json({ message: "Bin not found" }, { status: 404 });
    }

    const now = new Date();

    // Update bin status + heartbeat timestamp
    await prisma.bin.update({
      where: { id: bin.id },
      data: {
        lastHeartBeat: now,
        status: BinStatus.FUNCTIONAL,
      },
    });

    return NextResponse.json(
      { message: "Heartbeat logged successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Heartbeat API error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
