import prisma from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
type Client = {
  controller: ReadableStreamDefaultController;
  close: () => void;
};
let clients: Client[] = [];

export const PUT = async (req: NextRequest) => {
  const encoder = new TextEncoder();
  try {
    const { disposalId, userId } = await req.json();
    if (!disposalId) {
      return NextResponse.json(
        { message: "Missing fields: [disposalId]" },
        { status: 400 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { message: "Missing fields: [userId]" },
        { status: 400 }
      );
    }
    const result = await prisma.disposal.findUnique({
      where: { id: disposalId, isScanned: false },
    });
    if (!result) {
      return NextResponse.json(
        { message: "No disposal found" },
        { status: 404 }
      );
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    await prisma.disposal.update({
      where: { id: disposalId },
      data: {
        userId: userId,
        isScanned: true,
      },
    });
    clients.forEach((client) => {
      client.controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ updated: true })}\n\n`)
      );
    });
    return NextResponse.json({ message: "Updated disposal" }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
  }
  return NextResponse.json(
    { message: "An unknown error occurred" },
    { status: 500 }
  );
};

export const GET = async () => {
  const encoder = new TextEncoder();
  try {
    const stream = new ReadableStream({
      start(controller) {
        const closeClient = () => {
          clients = clients.filter(
            (client) => client.controller !== controller
          );
        };
        clients.push({ controller, close: closeClient });

        const interval = setInterval(() => {
          if (controller.desiredSize === 0) {
            closeClient();
            clearInterval(interval);
          }
        }, 1000);
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
