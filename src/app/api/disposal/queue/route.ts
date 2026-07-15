import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import jwt from "jsonwebtoken"

export const POST = async (req: NextRequest) => {
  try {
    const apiKey = req.headers.get("x-api-key")
    if (apiKey !== process.env.API_KEY) {
      return NextResponse.json(
        { message: "Permission denied" },
        { status: 401 }
      )
    }

    const { userId } = await req.json()

    if (!userId) {
      return NextResponse.json(
        { message: "Missing userId" },
        { status: 400 }
      )
    }

    // A kiosk session's throws land seconds apart, so an OPEN queue much
    // older than that is a leftover from a session nobody scanned. Reusing
    // it hands the entire backlog to the next person who scans (27 stale
    // disposals -> 1720 points on one scan), so close it and start fresh.
    const QUEUE_REUSE_WINDOW_MS = 10 * 60 * 1000

    const existingQueue = await prisma.disposalQueue.findFirst({
      where: { userId, status: "OPEN" },
      orderBy: { createdAt: "desc" },
    })

    if (existingQueue) {
      const ageMs = Date.now() - existingQueue.createdAt.getTime()
      if (ageMs <= QUEUE_REUSE_WINDOW_MS) {
        console.log("Reusing existing OPEN queue:", existingQueue.id)
        return NextResponse.json({ queue: existingQueue }, { status: 200 })
      }
      await prisma.disposalQueue.update({
        where: { id: existingQueue.id },
        data: { status: "CLOSED" },
      })
      console.log("Closed stale OPEN queue:", existingQueue.id)
    }

    // Create a new queue if none found
    const newQueue = await prisma.disposalQueue.create({
      data: {
        userId,
        status: "OPEN",
      },
    })

    console.log("🆕 Created new queue:", newQueue.id)
    return NextResponse.json({ queue: newQueue }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

// PUT → attach an existing disposal to a queue
export const PUT = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json(
        { message: "Missing authorization header!" },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!)
    if (typeof decoded === "string") {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      )
    }

    const { disposalId, queueId } = await req.json()
    if (!disposalId || !queueId) {
      return NextResponse.json(
        { message: "Missing disposalId or queueId!" },
        { status: 400 }
      )
    }

    // update disposal with queueId
    const updated = await prisma.disposal.update({
      where: { id: disposalId },
      data: { queueId },
    })

    return NextResponse.json({ disposal: updated }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred"
    return NextResponse.json({ message }, { status: 500 })
  }
}