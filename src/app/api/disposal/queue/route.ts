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

    // Check for an existing OPEN queue for this user
    const existingQueue = await prisma.disposalQueue.findFirst({
      where: { userId, status: "OPEN" },
    })

    if (existingQueue) {
      console.log("Reusing existing OPEN queue:", existingQueue.id)
      return NextResponse.json({ queue: existingQueue }, { status: 200 })
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