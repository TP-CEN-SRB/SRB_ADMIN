import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import { generateTransferQrToken } from "@/lib/jwt-tokens";

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) return NextResponse.json({ message: "Missing auth" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decoded === "string") return NextResponse.json({ message: "Invalid token" }, { status: 401 });

    const { amount } = await req.json();
    const senderId = decoded.userId;

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    const senderPoints = await prisma.point.findUnique({ where: { userId: senderId } });
    if (!senderPoints || senderPoints.balance < amount) {
      return NextResponse.json({ message: "Insufficient points" }, { status: 400 });
    }

    const session = await prisma.transferSession.create({
      data: {
        senderId,
        amount,
        status: "PENDING",
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    const qrToken = generateTransferQrToken({
      sessionId: session.id,
      senderId,
      amount,
      senderName: user?.name ?? "Unknown",
    });

    return new NextResponse(`${qrToken}`, {
  status: 200,
  headers: { "Content-Type": "text/plain" },
});
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};
