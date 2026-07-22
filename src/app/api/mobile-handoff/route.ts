import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { generateMobileHandoffToken, verifyMobileHandoffToken } from "@/lib/jwt-tokens"

const MOBILE_APP_URL = "https://tp-cen-srb.github.io/RecycleTP/"
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days, matches better-auth's default

// Hit by the "Go to Mobile App" link/button for an already-logged-in user.
// Issues a short-lived one-time token and redirects to the mobile app with
// it attached - the mobile app then exchanges it via POST below before it
// expires.
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.redirect(MOBILE_APP_URL)
  }

  const token = generateMobileHandoffToken(session.user.id)
  return NextResponse.redirect(`${MOBILE_APP_URL}?handoff=${token}`)
}

// Called by the mobile app (cross-origin, see next.config.ts CORS headers)
// to exchange a handoff token for a real session, so the user doesn't have
// to log in again there. Creates a new Session row directly via Prisma -
// same pattern as lib/createCredentialUser.ts - rather than going through
// an authenticated better-auth endpoint, since the mobile app has no
// session of its own yet at this point.
export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()
    if (!token || typeof token !== "string") {
      return NextResponse.json({ message: "Missing token" }, { status: 400 })
    }

    let payload: { userId: string }
    try {
      payload = verifyMobileHandoffToken(token)
    } catch {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const session = await prisma.session.create({
      data: {
        id: randomUUID(),
        token: randomUUID(),
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
      },
    })

    return NextResponse.json({
      sessionToken: session.token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        faculty: user.faculty,
      },
    })
  } catch (error) {
    console.error("[mobile-handoff] error:", error)
    return NextResponse.json({ message: "Failed to exchange token" }, { status: 500 })
  }
}
