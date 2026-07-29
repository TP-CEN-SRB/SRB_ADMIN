import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

// Pages that are public, but only if you're signed in - anonymous visitors
// get bounced to /login instead of seeing a broken/empty page.
const AUTH_REQUIRED_PATHS = ["/about", "/contact", "/projects"]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await auth.api.getSession({ headers: request.headers })

  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  if (AUTH_REQUIRED_PATHS.includes(pathname) && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/about", "/contact", "/projects"],
}
