import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { computeBinUptime, type UptimeRange } from "@/lib/uptime"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

// ---------------------
// MAIN HANDLER
// ---------------------
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const managerId = searchParams.get("managerId")
    const range = (searchParams.get("range") || "hour") as UptimeRange

    if (!managerId) {
      return NextResponse.json(
        { error: "Missing managerId" },
        { status: 400 }
      )
    }

    const bins = await prisma.bin.findMany({
      where: { userId: managerId },
      select: {
        id: true,
        binMaterial: { select: { name: true } },
      },
    })

    const results = await computeBinUptime(
      bins.map(bin => ({ id: bin.id, name: bin.binMaterial.name })),
      range
    )

    return NextResponse.json(results)
  } catch (err) {
    console.error("❌ Redis Uptime API error:", err)
    return NextResponse.json(
      { error: "Failed to fetch uptime" },
      { status: 500 }
    )
  }
}
