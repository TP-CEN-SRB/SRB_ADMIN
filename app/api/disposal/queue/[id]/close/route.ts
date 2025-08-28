import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { message: "Permission denied" },
        { status: 401 }
      );
    }

    const queueId = params.id;

    // 📴 Close the queue
    const closedQueue = await prisma.disposalQueue.update({
      where: { id: queueId },
      data: { status: "CLOSED" },
    });

    console.log("🔒 Closed queue:", closedQueue.id);
    return NextResponse.json({ queue: closedQueue }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
