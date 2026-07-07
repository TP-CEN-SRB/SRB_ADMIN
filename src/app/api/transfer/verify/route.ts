import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/db"
import { verifyQrToken } from "@/lib/jwt-tokens"

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token)
      return NextResponse.json({ message: "Missing auth" }, { status: 401 })

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!)
    if (typeof decoded === "string")
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })

    const { token: qrToken } = await req.json()
    const receiverId = decoded.userId

    const payload = verifyQrToken(qrToken)
    const { sessionId, senderId, amount, senderName } = payload

    const session = await prisma.transferSession.findUnique({
      where: { id: sessionId },
    })

    if (!session || session.status !== "PENDING") {
      return NextResponse.json(
        { message: "Invalid or redeemed session" },
        { status: 400 }
      )
    }

    if (senderId === receiverId) {
      return NextResponse.json(
        { message: "Sender and receiver cannot be the same" },
        { status: 400 }
      )
    }

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
      select: { name: true },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          sessionId,
          amount,
          senderId,
          receiverId,
          senderName: senderName ?? "Unknown",
          receiverName: receiver?.name ?? "Unknown",
        },
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      { message: "Verification failed" },
      { status: 500 }
    )
  }
}
