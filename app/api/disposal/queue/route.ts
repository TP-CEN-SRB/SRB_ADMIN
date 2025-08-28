import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const POST = async (req: NextRequest) => {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { message: "Permission denied" },
        { status: 401 }
      );
    }

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "Missing userId" },
        { status: 400 }
      );
    }

    // 🔍 Check for an existing OPEN queue for this user
    const existingQueue = await prisma.disposalQueue.findFirst({
      where: { userId, status: "OPEN" },
    });

    if (existingQueue) {
      console.log("♻️ Reusing existing OPEN queue:", existingQueue.id);
      return NextResponse.json({ queue: existingQueue }, { status: 200 });
    }

    // 🚀 Create a new queue if none found
    const newQueue = await prisma.disposalQueue.create({
      data: {
        userId,
        status: "OPEN", // default if your Prisma model has it, but explicit is good
      },
    });

    console.log("🆕 Created new queue:", newQueue.id);
    return NextResponse.json({ queue: newQueue }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
