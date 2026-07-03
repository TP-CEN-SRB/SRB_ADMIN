import { prisma } from "@/lib/db";
import { LoginSchema } from "@/schemas/auth";
import { Role } from "@/generated/prisma";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const POST = async (req: NextRequest) => {
  try {
    const { email, password } = await req.json();
    const validatedFields = LoginSchema.safeParse({ email, password });
    if (!validatedFields.success) {
      return NextResponse.json(
        {
          message: "Invalid fields!",
        },
        { status: 400 }
      );
    }
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
        role: Role.BIN,
      },
    });
    if (!existingUser) {
      return NextResponse.json(
        {
          message: "Invalid credentials",
        },
        { status: 400 }
      );
    }
    const isMatched = await compare(password, existingUser.password);
    if (!isMatched) {
      return NextResponse.json(
        {
          message: "Invalid credentials",
        },
        { status: 400 }
      );
    }
    if (!existingUser.emailVerified) {
      return NextResponse.json({
        message: "Bin manager is not verified",
        status: 401,
      });
    }
    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      process.env.NEXT_JWT_SECRET_KEY!,
      { expiresIn: "90d" }
    );
    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
