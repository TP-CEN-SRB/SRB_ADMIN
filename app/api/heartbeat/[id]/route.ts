import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

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
          name: {
            equals: material,
            mode: "insensitive",
          },
        },
      },
    });

    if (!bin) {
      return NextResponse.json({ message: "Bin not found" }, { status: 404 });
    }

    await prisma.bin.update({
      where: { id: bin.id },
      data: { lastHeartBeat: new Date() },
    });

    return NextResponse.json({ message: "Heartbeat updated." }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
