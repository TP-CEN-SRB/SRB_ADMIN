import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/db"
import { verifyRedemptionQrToken } from "@/lib/jwt-tokens"

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ message: "Missing auth" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!)
    if (typeof decoded === "string") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    if (decoded.role !== "STORE") {
      return NextResponse.json({ message: "Only store accounts can fulfill vouchers" }, { status: 403 })
    }

    const { token: qrToken } = await req.json()
    const payload = verifyRedemptionQrToken(qrToken)
    const { redemptionId } = payload
    const storeId = decoded.userId

    const redemption = await prisma.redemption.findUnique({
      where: { id: redemptionId },
      include: {
        user: { select: { name: true } },
        reward: { select: { name: true, allowedStores: { select: { id: true } } } },
      },
    })

    if (!redemption || redemption.status !== "PENDING") {
      return NextResponse.json({ message: "Voucher already used or invalid" }, { status: 400 })
    }

    const allowedStoreIds = redemption.reward.allowedStores.map((store) => store.id)
    if (allowedStoreIds.length > 0 && !allowedStoreIds.includes(storeId)) {
      return NextResponse.json({ message: "This voucher cannot be used at your store" }, { status: 403 })
    }

    const fulfilledAt = new Date()
    await prisma.redemption.update({
      where: { id: redemptionId },
      data: { status: "FULFILLED", fulfilledAt, fulfilledById: storeId },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          redemptionId,
          rewardName: redemption.reward.name,
          memberName: redemption.user.name ?? "Unknown",
          fulfilledAt: fulfilledAt.toISOString(),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ message: "QR code has expired" }, { status: 401 })
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Invalid QR code" }, { status: 401 })
    }
    return NextResponse.json({ message: "Fulfillment failed" }, { status: 500 })
  }
}
