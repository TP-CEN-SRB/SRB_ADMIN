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
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: capitalizeFirstLetter(data.name),
        email: data.email,
        password: data.password,
        faculty: data.faculty,
        diploma: data.diploma,
        // role is never taken from client input - always STUDENT here.
        role: "STUDENT",
      },
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
