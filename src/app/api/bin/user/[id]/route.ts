import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params

    const authorization = req.headers.get("x-api-key")
    if (authorization !== process.env.API_KEY) {
      return NextResponse.json({ message: "Permission denied!" }, { status: 401 })
    }

    const binManagerId = id
    const searchParams = req.nextUrl.searchParams

    // Supports: ?material=plastic&material=paper and ?material=plastic,paper
    const materials = searchParams
      .getAll("material")
      .flatMap((m) => m.split(","))       // split comma lists
      .map((m) => m.trim().toUpperCase()) // normalize
      .filter(Boolean)

    const bins = await prisma.bin.findMany({
      where: {
        userId: binManagerId,
        ...(materials.length > 0 && {
          binMaterial: {
            name: { in: materials }, // e.g. ["PLASTIC","PAPER"]
          },
        }),
      },
      select: {
        status: true,
        currentCapacity: true,
        binMaterial: { select: { name: true } },
      },
    })

    if (bins.length === 0) {
      return NextResponse.json({ message: "No bin found!" }, { status: 404 })
    }

    return NextResponse.json({ bins }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ message }, { status: 500 })
  }
}
