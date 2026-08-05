import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { ActivityLogSource } from "@/generated/prisma"

const allowedOrigins = [
  "http://localhost:3000",              // SRB_LOCAL dev
  "https://cen-smart-bin.vercel.app",   // SRB_admin itself
]

// Crashlog has carried `source` and `binId` for a while, but this route only
// ever wrote `message` - so every row landed as an unattributed APP_ERROR and
// the log page's source filter had nothing to discriminate on. Both are now
// accepted, and both stay optional: a kiosk running an older build posts
// { message } alone and must keep working.
const VALID_SOURCES: string[] = Object.values(ActivityLogSource)

export const POST = async (req: NextRequest) => {
  const origin = req.headers.get("origin") || "*"

  if (!allowedOrigins.includes(origin)) {
    return new NextResponse("Origin not allowed", { status: 403 })
  }

  const apiKey = req.headers.get("x-api-key")
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { message, source, binId } = await req.json()
    if (!message) {
      return NextResponse.json({ message: "Missing message" }, { status: 400 })
    }

    await prisma.crashlog.create({
      data: {
        message: String(message),
        // Unrecognised values fall back rather than 400 - a logging endpoint
        // rejecting a log is worse than filing it under the default.
        source: VALID_SOURCES.includes(source)
          ? (source as ActivityLogSource)
          : ActivityLogSource.APP_ERROR,
        binId: typeof binId === "string" && binId.length > 0 ? binId : null,
      },
    })

    const res = NextResponse.json({ success: true })
    res.headers.set("Access-Control-Allow-Origin", origin)
    return res
  } catch (err) {
    return NextResponse.json({ message: "Internal error" }, { status: 500 })
  }
}

export const OPTIONS = async (req: NextRequest) => {
  const origin = req.headers.get("origin") || "*"
  const res = new NextResponse(null, { status: 204 })
  res.headers.set("Access-Control-Allow-Origin", origin)
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS")
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, x-api-key")
  return res
}
