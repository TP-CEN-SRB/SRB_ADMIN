import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params; 

    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { message: "Permission denied" },
        { status: 401 }
      );
    }

    const queueId = id;

    // Close the queue and fetch userId (bin manager)
    const closedQueue = await prisma.disposalQueue.update({
      where: { id: queueId },
      data: { status: "CLOSED" },
      select: { id: true, userId: true, status: true },
    });

    console.log("==============================================");
    console.log("[closeQueue] Queue closed in DB");
    console.log("  queueId:", closedQueue.id);
    console.log("  userId :", closedQueue.userId);
    console.log("  status :", closedQueue.status);

    // Prepare channel + payload
    const channel = `disposal-qr-${closedQueue.userId}-${closedQueue.id}`;
    const payload = {
      updated: true,
      queueId: closedQueue.id,
    };

    console.log("[closeQueue] Triggering Pusher event...");
    console.log("  Channel :", channel);
    console.log("  Event   : disposal-update");
    console.log("  Payload :", payload);

    // Notify QrScanListener
    await pusherServer.trigger(channel, "disposal-update", payload);

    console.log("[closeQueue] Event successfully sent to Pusher");
    console.log("==============================================");

    return NextResponse.json({ queue: closedQueue }, { status: 200 });
  } catch (error) {
    console.error("[closeQueue API] Error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
};
