import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { prisma } from "@/lib/db"

export const GET = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ message: "Missing auth" }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!)
    if (typeof decoded === "string") {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const redemptions = await prisma.redemption.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        createdAt: true,
        fulfilledAt: true,
        reward: {
          select: { id: true, name: true, description: true, image: true, pointsRequired: true },
        },
      },
    })

    return NextResponse.json({ redemptions }, { status: 200 })
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ message: "Token has expired!" }, { status: 401 })
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Token is invalid!" }, { status: 401 })
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}
