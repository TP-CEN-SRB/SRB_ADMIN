import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { utapi } from "@/lib/uploadthing"

/**
 * Delete UploadThing-hosted disposal images older than the retention
 * window. Disposal rows themselves are kept (they're the points/weight
 * history) - only imageUrl is cleared, so storage doesn't grow forever.
 * Trigger daily via cron job with correct `x-api-key` header!
 */
const DISPOSAL_IMAGE_RETENTION_DAYS = 90
const BATCH_SIZE = 500

const extractFileKey = (url: string) => url.split("/f/").pop()

export const DELETE = async (req: NextRequest) => {
  try {
    const apiKey = req.headers.get("x-api-key")
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - DISPOSAL_IMAGE_RETENTION_DAYS)

    const staleDisposals = await prisma.disposal.findMany({
      where: {
        imageUrl: { not: null },
        createdAt: { lt: cutoff },
      },
      select: { id: true, imageUrl: true },
      take: BATCH_SIZE,
    })

    if (staleDisposals.length === 0) {
      return NextResponse.json(
        { message: "No stale disposal images to delete" },
        { status: 200 }
      )
    }

    const fileKeys = staleDisposals
      .map((d) => extractFileKey(d.imageUrl!))
      .filter((key): key is string => !!key)

    if (fileKeys.length > 0) {
      await utapi.deleteFiles(fileKeys)
    }

    await prisma.disposal.updateMany({
      where: { id: { in: staleDisposals.map((d) => d.id) } },
      data: { imageUrl: null },
    })

    return NextResponse.json(
      {
        message: `Deleted ${fileKeys.length} disposal image(s) older than ${DISPOSAL_IMAGE_RETENTION_DAYS} days.`,
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }
    return NextResponse.json({ message: "Unknown error" }, { status: 500 })
  }
}
