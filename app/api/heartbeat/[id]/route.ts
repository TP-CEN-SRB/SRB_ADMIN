// app/api/heartbeat/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { BinStatus } from "@prisma/client";

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ message: "Permission denied" }, { status: 401 });
    }

    const userId = params.id;
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

    // update bin
    await prisma.bin.update({
      where: { id: bin.id },
      data: {
        lastHeartBeat: now,
        status: BinStatus.FUNCTIONAL,
      },
    });

    // create uptime log if no recent duplicate within 30 seconds
    const recentLog = await prisma.binUptimeLog.findFirst({
      where: {
        binId: bin.id,
        timestamp: {
          gte: new Date(Date.now() - 30 * 1000), // last 30s
        },
      },
    });

    if (!recentLog) {
      await prisma.binUptimeLog.create({
        data: {
          binId: bin.id,
          timestamp: now,
          status: BinStatus.FUNCTIONAL,
        },
      });
      console.log(`📡 Heartbeat logged for ${bin.id} (${material})`);
    } else {
      console.log(`⏱️ Skipped duplicate heartbeat log for ${bin.id}`);
    }

    return NextResponse.json({ message: "Heartbeat logged successfully." }, { status: 200 });
  } catch (error) {
    console.error("❌ Heartbeat API error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
