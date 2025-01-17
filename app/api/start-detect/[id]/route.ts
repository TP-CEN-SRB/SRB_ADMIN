import prisma from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const authorization = req.headers.get("x-api-key");
    if (authorization !== process.env.API_KEY) {
      return NextResponse.json(
        { message: "Permission denied!" },
        { status: 401 }
      );
    }
    const id = params.id;
    const binManager = await prisma.user.findUnique({ where: { id: id } });
    if (!binManager) {
      return NextResponse.json(
        { message: "Bin manager not found!" },
        { status: 404 }
      );
    }
    const { start } = await req.json();
    if (start !== true) {
      return NextResponse.json(
        { message: "Invalid start parameter" },
        { status: 400 }
      );
    }
    await pusherServer.trigger(`start-detect-${params.id}`, "start-update", {
      start,
    });
    return NextResponse.json(
      { message: "Starting detection" },
      { status: 200 }
    );
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
