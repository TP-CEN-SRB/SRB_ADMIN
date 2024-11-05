import prisma from "@/lib/db";
import { LoginSchema } from "@/schemas/auth";
import { Role } from "@prisma/client";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const POST = async (req: NextRequest) => {
  try {
    // const authorization = req.headers.get("x-api-key");
    // if (authorization !== process.env.API_KEY) {
    //   return NextResponse.json(
    //     { message: "Permission denied!" },
    //     { status: 401 }
    //   );
    // }
    const { email, password } = await req.json();
    const validatedFields = LoginSchema.safeParse({ email, password });
    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten();
      return NextResponse.json(
        {
          message: "Something went wrong",
          errors: errors.fieldErrors,
        },
        { status: 400 }
      );
    }
    const data = validatedFields.data;
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email, role: Role.STUDENT },
    });
    if (!existingUser) {
      return NextResponse.json({ message: "User not found!" }, { status: 404 });
    }
    const isMatched = await compare(password, existingUser.password);
    if (!isMatched) {
      return NextResponse.json(
        {
          message: "Invalid credentials!",
        },
        { status: 400 }
      );
    }
    if (!existingUser.emailVerified) {
      return NextResponse.json(
        { message: "Email not verified!" },
        { status: 401 }
      );
    }
    const token = jwt.sign(
      { userId: existingUser.id },
      process.env.NEXT_JWT_SECRET_KEY!,
      { expiresIn: "7d" }
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

/*
 *Test
 */
export const GET = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Missing authorization header!" },
        { status: 401 }
      );
    }
    try {
      const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
      }
    }
    const users = await prisma.user.findMany();
    return NextResponse.json(users, { status: 200 });
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
