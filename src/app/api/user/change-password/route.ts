import { prisma } from "@/lib/db"
import { NewStudentPasswordSchema } from "@/schemas/auth"
import { hashPassword, verifyPassword } from "better-auth/crypto"
import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json(
        { message: "Missing authorization header!" },
        { status: 401 }
      )
    }

    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!)
    if (typeof decodedToken === "string" || !decodedToken.userId) {
      return NextResponse.json({ message: "Unauthorized access!" }, { status: 401 })
    }

    const { oldPassword, password, confirmPassword } = await req.json()

    const existingUser = await prisma.user.findUnique({
      where: { id: decodedToken.userId, role: "STUDENT" },
    })
    if (!existingUser) {
      return NextResponse.json({ message: "Invalid Credentials" }, { status: 404 })
    }

    // better-auth keeps the credential password on the Account row, not on
    // User anymore - so this has to go through its own hash/verify instead
    // of the old bcrypt compare(oldPassword, existingUser.password).
    const account = await prisma.account.findFirst({
      where: { userId: existingUser.id, providerId: "credential" },
    })
    if (!account?.password) {
      return NextResponse.json({ message: "Invalid Credentials" }, { status: 404 })
    }

    const isMatched = await verifyPassword({ hash: account.password, password: oldPassword })
    if (!isMatched) {
      return NextResponse.json({ message: "Invalid credentials!" }, { status: 400 })
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ message: "Passwords do not match" }, { status: 400 })
    }

    const validatedFields = NewStudentPasswordSchema.safeParse({ password, confirmPassword })
    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten()
      return NextResponse.json(
        { message: "Something went wrong", errors: errors.fieldErrors },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(validatedFields.data.password)
    await prisma.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ message: "Password changed sucessfully!" }, { status: 200 })
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ message: "Token has expired!" }, { status: 401 })
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: "Token is invalid!" }, { status: 401 })
    } else if (error instanceof Error) {
      return NextResponse.json({ message: error.message, error: error.message }, { status: 500 })
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    )
  }
}
