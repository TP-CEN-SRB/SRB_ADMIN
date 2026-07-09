import { auth } from "@/lib/auth"
import { LoginSchema } from "@/schemas/auth"
import { APIError } from "better-auth"
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Roles allowed to sign in through the mobile app. ADMIN/BIN use their own
// portals - matches the restriction the old NextAuth-era route enforced.
const MOBILE_ROLES = ["STUDENT", "STORE", "STAFF"]

export const POST = async (req: NextRequest) => {
  try {
    const body: { email: string; password: string } = await req.json()
    const email = String(body.email).toLowerCase().trim()
    const password = body.password

    const validatedFields = LoginSchema.safeParse({ email, password })
    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten()
      return NextResponse.json(
        { message: "Something went wrong", errors: errors.fieldErrors },
        { status: 400 }
      )
    }

    const data = validatedFields.data

    // Delegates password verification (and the requireEmailVerification
    // check) to better-auth itself, since it owns the credential/account
    // table now. This does create an (unused, uncollected) better-auth
    // session row as a side effect - harmless, just not forwarded to the
    // mobile client.
    const signInResult = await auth.api.signInEmail({
      body: { email: data.email, password: data.password },
    })

    const role = (signInResult.user as { role?: string }).role
    if (!role || !MOBILE_ROLES.includes(role)) {
      return NextResponse.json(
        { message: "Invalid Credentials" },
        { status: 404 }
      )
    }

    const token = jwt.sign(
      {
        userId: signInResult.user.id,
        name: signInResult.user.name,
        role,
      },
      process.env.NEXT_JWT_SECRET_KEY!,
      { expiresIn: "7d" }
    )

    return NextResponse.json({ token }, { status: 200 })
  } catch (error) {
    if (error instanceof APIError) {
      if (error.body?.code === "EMAIL_NOT_VERIFIED") {
        return NextResponse.json(
          {
            message: "Email not verified",
            requiresVerification: true,
          },
          { status: 403 }
        )
      }
      return NextResponse.json(
        { message: error.body?.message ?? error.message },
        { status: error.statusCode ?? 400 }
      )
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    )
  }
}
