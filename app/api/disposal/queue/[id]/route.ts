import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import jwt from "jsonwebtoken";

// GET all disposals in a queue
export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Missing authorization header!" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decoded === "string") return NextResponse.json({ message: "Unauthorized access!" }, { status: 401 });

    const disposals = await prisma.disposal.findMany({
      where: { queueId: params.id },
      include: { user: true, queue: true },
    });

    return NextResponse.json({ disposals }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message }, { status: 500 });
  }
};

// PUT → attach an existing disposal to the queue
export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Missing authorization header!" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decoded === "string") return NextResponse.json({ message: "Unauthorized access!" }, { status: 401 });

    const { disposalId } = await req.json();
    if (!disposalId) return NextResponse.json({ message: "Missing disposalId!" }, { status: 400 });

    // update disposal with queueId
    const updated = await prisma.disposal.update({
      where: { id: disposalId },
      data: { queueId: params.id },
    });

    return NextResponse.json({ disposal: updated }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ message }, { status: 500 });
  }
};
