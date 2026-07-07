// app/api/bin-data/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const managerId = searchParams.get("managerId")

    if (!managerId) {
      return NextResponse.json({ error: "Missing managerId" }, { status: 400 })
    }

    const bins = await prisma.bin.findMany({
      where: { userId: managerId },
      include: {
        binMaterial: { select: { name: true } },
      },
    })

    const now = new Date()
    const data = bins.map((bin) => {
      const last = bin.lastHeartBeat ? new Date(bin.lastHeartBeat) : null
      const diffMins = last ? (now.getTime() - last.getTime()) / 60000 : Infinity
      const isOnline = diffMins < 10 // Only online vs offline
      return {
        id: bin.id,
        name: bin.binMaterial.name,
        isOnline,
        lastHeartBeat: bin.lastHeartBeat,
        status: isOnline ? "FUNCTIONAL" : "UNDER_MAINTENANCE",
      }
    })

    return NextResponse.json(data)
  } catch (err) {
    console.error("❌ Error in /api/bin-data:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
