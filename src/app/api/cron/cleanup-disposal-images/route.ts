import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { utapi } from "@/lib/uploadthing"

/**
 * Delete UploadThing-hosted disposal images older than the retention
 * window. Disposal rows themselves are kept (they're the points/weight
 * history) - only imageUrl is cleared, so storage doesn't grow forever.
 *
 * Triggered two ways:
 * - GET, by Vercel's native Cron Jobs (see vercel.json) - Vercel signs
 *   these with `Authorization: Bearer <CRON_SECRET>` automatically once
 *   CRON_SECRET is set as a Vercel env var.
 * - DELETE, for manual/external triggering with the existing `x-api-key`
 *   header, matching the other hand-rolled cron routes in this project.
 */
const DISPOSAL_IMAGE_RETENTION_DAYS = 90
const BATCH_SIZE = 500

const extractFileKey = (url: string) => url.split("/f/").pop()

const runCleanup = async function(){
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
    return { deletedCount: 0 }
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

  return { deletedCount: fileKeys.length }
}

export const GET = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization")
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { deletedCount } = await runCleanup()
    return NextResponse.json(
      {
        message:
          deletedCount === 0
            ? "No stale disposal images to delete"
            : `Deleted ${deletedCount} disposal image(s) older than ${DISPOSAL_IMAGE_RETENTION_DAYS} days.`,
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

export const DELETE = async (req: NextRequest) => {
  try {
    const apiKey = req.headers.get("x-api-key")
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { deletedCount } = await runCleanup()
    return NextResponse.json(
      {
        message:
          deletedCount === 0
            ? "No stale disposal images to delete"
            : `Deleted ${deletedCount} disposal image(s) older than ${DISPOSAL_IMAGE_RETENTION_DAYS} days.`,
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
