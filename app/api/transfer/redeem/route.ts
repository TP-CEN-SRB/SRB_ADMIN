import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "@/lib/db";
import { verifyQrToken } from "@/lib/jwt-tokens";

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Missing auth" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decoded === "string") return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    const { qrToken } = await req.json();
    const receiverId = decoded.userId;

    const payload = verifyQrToken(qrToken);
    const { sessionId, senderId, amount, type } = payload;

    if (type !== "transfer") {
      return NextResponse.json({ message: "Invalid QR type" }, { status: 400 });
    }

    const session = await prisma.transferSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status !== "pending") {
      return NextResponse.json({ message: "Invalid or redeemed session" }, { status: 400 });
    }

    if (senderId === receiverId) {
      return NextResponse.json({ message: "Sender and receiver cannot be the same" }, { status: 400 });
    }

    const senderPoints = await prisma.point.findUnique({ where: { userId: senderId } });
    if (!senderPoints || senderPoints.balance < amount) {
      return NextResponse.json({ message: "Sender has insufficient points" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.point.update({
        where: { userId: senderId },
        data: { balance: { decrement: amount } },
      }),
      prisma.point.upsert({
        where: { userId: receiverId },
        create: {
          userId: receiverId,
          balance: amount,
        },
        update: {
          balance: { increment: amount },
        },
      }),
      prisma.transferSession.update({
        where: { id: sessionId },
        data: {
          receiverId,
          status: "redeemed",
          redeemedAt: new Date(),
        },
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};
