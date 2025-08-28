import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const POST = async (req: NextRequest) => {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ message: "Permission denied" }, { status: 401 });
    }

    // Create a new disposal queue
    const queue = await prisma.disposalQueue.create({ data: {} });

    return NextResponse.json({ queue }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
