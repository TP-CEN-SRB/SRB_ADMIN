import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { SignUpStudentSchema } from "@/schemas/auth"
import { APIError } from "better-auth"
import { NextRequest, NextResponse } from "next/server"

const capitalizeFirstLetter = (input: string) =>
  input.length === 0 ? input : input[0].toUpperCase() + input.slice(1).toLowerCase()

export const POST = async (req: NextRequest) => {
  try {
    const {
      name,
      email: rawEmail,
      password,
      confirmPassword,
      faculty,
      diploma,
      callbackURL,
    } = await req.json()

    const email = String(rawEmail).toLowerCase().trim()

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      )
    }

    const validatedFields = SignUpStudentSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      faculty,
      diploma,
    })

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten()
      return NextResponse.json(
        { message: "Something went wrong", errors: errors.fieldErrors },
        { status: 400 }
      )
    }

    const data = validatedFields.data

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      )
    }

    // better-auth creates the user + credential account and, since
    // requireEmailVerification is on, automatically sends the verification
    // email via the sendVerificationEmail hook configured in auth.ts.
    // role is never taken from client input - always STUDENT here.
    // callbackURL controls where the verification link lands the user after
    // confirming their email: the admin dashboard's own signup flow passes
    // its own page here. The mobile app doesn't pass one, so it falls back
    // to /api/mobile-handoff (same origin as the session cookie
    // autoSignInAfterVerification just set) instead of RecycleTP's bare
    // root, so that redirect picks up the fresh session and forwards a
    // handoff token to the mobile app - otherwise the user verifies and gets
    // a session here, but the mobile app itself never sees it and still
    // shows the login screen.
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: capitalizeFirstLetter(data.name),
        email: data.email,
        password: data.password,
        faculty: data.faculty,
        diploma: data.diploma,
        role: "STUDENT",
        callbackURL: typeof callbackURL === "string" && callbackURL
          ? callbackURL
          : "https://cen-smart-bin.vercel.app/api/mobile-handoff",
      },
      headers: req.headers,
    })

    // better-auth's adapter doesn't know about our Point relation, so it
    // has to be created as a separate step (old code did this inline via
    // a nested Prisma create on prisma.user.create).
    await prisma.point.create({ data: { userId: signUpResult.user.id } })

    return NextResponse.json(
      { message: "Confirmation email sent!" },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof APIError) {
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
