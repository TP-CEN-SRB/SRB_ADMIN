import { auth } from "@/lib/auth"
import { LoginSchema } from "@/schemas/auth"
import { APIError } from "better-auth"
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export const POST = async (req: NextRequest) => {
  try {
    const body: { email: string; password: string } = await req.json()
    const email = String(body.email).toLowerCase().trim()
    const password = body.password

    const validatedFields = LoginSchema.safeParse({ email, password })
    if (!validatedFields.success) {
      return NextResponse.json({ message: "Invalid fields!" }, { status: 400 })
    }

    const data = validatedFields.data

    const signInResult = await auth.api.signInEmail({
      body: { email: data.email, password: data.password },
      headers: req.headers,
    })

    const role = (signInResult.user as { role?: string }).role
    if (role !== "BIN") {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 })
    }

    const token = jwt.sign(
      { userId: signInResult.user.id },
      process.env.NEXT_JWT_SECRET_KEY!,
      { expiresIn: "90d" }
    )

    return NextResponse.json({ token }, { status: 200 })
  } catch (error) {
    if (error instanceof APIError) {
      if (error.body?.code === "EMAIL_NOT_VERIFIED") {
        return NextResponse.json(
          { message: "Bin manager is not verified" },
          { status: 401 }
        )
      }
      return NextResponse.json(
        { message: error.body?.message ?? error.message },
        { status: error.statusCode ?? 400 }
      )
    }
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message, error: error.message }, { status: 500 })
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    )
  }
}
