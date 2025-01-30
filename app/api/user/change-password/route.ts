import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { NewStudentPasswordSchema } from "@/schemas/auth";
import prisma from "@/lib/db";
import { compare, hash } from "bcryptjs";

export const POST = async (req: NextRequest) => {
  try {
    const token = req.headers.get("Authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { message: "Missing authorization header!" },
        { status: 401 }
      );
    }
    const decodedToken = jwt.verify(token, process.env.NEXT_JWT_SECRET_KEY!);
    if (typeof decodedToken === "string") {
      return NextResponse.json(
        { message: "Unauthorized access!" },
        { status: 401 }
      );
    }
    const { oldPassword, password, confirmPassword } = await req.json();
    const existingUser = await prisma.user.findUnique({
      where: { id: decodedToken.userId, role: "STUDENT" },
    });
    if (!existingUser) {
      return NextResponse.json(
        { message: "Invalid Credentials" },
        { status: 404 }
      );
    }
    const isMatched = await compare(oldPassword, existingUser.password);
    if (!isMatched) {
      return NextResponse.json(
        {
          message: "Invalid credentials!",
        },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }
    const validatedFields = NewStudentPasswordSchema.safeParse({
      password,
      confirmPassword,
    });
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
    const hashedPassword = await hash(data.password, 10);
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { password: hashedPassword },
    });
    return NextResponse.json(
      { message: "Password changed sucessfully!" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json(
        { message: "Token has expired!" },
        { status: 401 }
      );
    } else if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { message: "Token is invalid!" },
        { status: 401 }
      );
    } else if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { message: "An unknown error occurred" },
      { status: 500 }
    );
  }
};
