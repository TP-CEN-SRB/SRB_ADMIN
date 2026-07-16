import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

const allowedOrigins = [
  "http://localhost:3000",              // SRB_LOCAL dev      
  "https://cen-smart-bin.vercel.app",   // SRB_admin itself
]

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
    const { message } = await req.json()
    if (!message) {
      return NextResponse.json({ message: "Missing message" }, { status: 400 })
    }

    await prisma.crashlog.create({ data: { message } })

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
