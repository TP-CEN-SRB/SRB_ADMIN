import { NextRequest, NextResponse } from "next/server"
import { getLatestGrbWeight } from "@/app/action/grb"

// Read-only endpoint for SRB_LOCAL to pull the Giant Rubbish Bin's latest
// weight reading out of Postgres. Same x-api-key pattern as
// src/app/api/crashlog/route.ts. GET-only and read-only, so - unlike
// crashlog - it doesn't gate on an Origin allowlist: a server-to-server poll
// from SRB_LOCAL has no Origin header to check, and CORS for browser callers
// is already handled globally in next.config.ts.
export const GET = async (req: NextRequest) => {
  const apiKey = req.headers.get("x-api-key")
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const latest = await getLatestGrbWeight()

    return NextResponse.json({
      weightInGrams: latest?.weightInGrams ?? null,
      recordedAt: latest?.createdAt ?? null,
    })
  } catch (err) {
    console.error("[grb-weight] fetch failed:", err)
    return NextResponse.json({ message: "Internal error" }, { status: 500 })
  }
}

export const OPTIONS = async (req: NextRequest) => {
  const origin = req.headers.get("origin") || "*"
  const res = new NextResponse(null, { status: 204 })
  res.headers.set("Access-Control-Allow-Origin", origin)
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, x-api-key")
  return res
}
