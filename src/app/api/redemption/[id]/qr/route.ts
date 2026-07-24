import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/db"
import { generateRedemptionQrToken } from "@/lib/jwt-tokens"

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ message: "Missing auth" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!)
    if (typeof decoded === "string") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { id } = await params

    const redemption = await prisma.redemption.findUnique({
      where: { id },
      include: { reward: { select: { name: true, pointsRequired: true } } },
    })

    if (!redemption || redemption.userId !== decoded.userId) {
      return NextResponse.json({ message: "Redemption not found" }, { status: 404 })
    }

    if (redemption.status !== "PENDING") {
      return NextResponse.json({ message: "Voucher already used" }, { status: 400 })
    }

    const qrToken = generateRedemptionQrToken({
      redemptionId: redemption.id,
      userId: redemption.userId,
      rewardName: redemption.reward.name,
      pointsRequired: redemption.reward.pointsRequired,
    })

    return new NextResponse(`${qrToken}`, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    })
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ message: "Token has expired!" }, { status: 401 })
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Token is invalid!" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
