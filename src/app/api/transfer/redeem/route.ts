import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/db"
import { verifyQrToken } from "@/lib/jwt-tokens"

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) return NextResponse.json({ message: "Missing auth" }, { status: 401 })

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!)
    if (typeof decoded === "string") return NextResponse.json({ message: "Invalid token" }, { status: 401 })

    const { token: qrToken } = await req.json()
    const receiverId = decoded.userId

    const payload = verifyQrToken(qrToken)
    const { sessionId, senderId, amount } = payload

    const session = await prisma.transferSession.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.status !== "PENDING") {
      return NextResponse.json({ message: "Invalid or redeemed session" }, { status: 400 })
    }

    if (senderId === receiverId) {
      return NextResponse.json({ message: "Sender and receiver cannot be the same" }, { status: 400 })
    }

    const senderPoints = await prisma.point.findUnique({ where: { userId: senderId } })
    if (!senderPoints || senderPoints.balance < amount) {
      return NextResponse.json({ message: "Sender has insufficient points" }, { status: 400 })
    }

    const [sender, receiver] = await Promise.all([
  prisma.user.findUnique({
    where: { id: senderId },
    select: { name: true },
  }),
  prisma.user.findUnique({
    where: { id: receiverId },
    select: { name: true },
  }),
])

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
      status: "REDEEMED",
      redeemedAt: new Date(),
    },
  }),
  prisma.transaction.create({
    data: {
      id: crypto.randomUUID(),
      userId: senderId,
      transactionType: "PURCHASE",
      pointsChange: -amount,
      description: `Transferred to ${receiver?.name ?? "Unknown"}`,
      updatedAt: new Date(),
    },
  }),
  prisma.transaction.create({
    data: {
      id: crypto.randomUUID(),
      userId: receiverId,
      transactionType: "PURCHASE",
      pointsChange: amount,
      description: `Received from ${sender?.name ?? "Unknown"}`,
      updatedAt: new Date(),
    },
  }),
])

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        amount,
        senderId,
        receiverId,
        senderName: sender?.name ?? "Unknown",
        receiverName: receiver?.name ?? "Unknown",
        redeemedAt: new Date().toISOString(),
      },
    }, { status: 200 })

  } catch {
    return NextResponse.json({ message: "Redemption failed" }, { status: 500 })
  }
}
