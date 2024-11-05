import prisma from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import { SignUpStudentSchema } from "@/schemas/auth";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { name, email, password } = await req.json();
    const validatedFields = SignUpStudentSchema.safeParse({
      name,
      email,
      password,
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
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        role: Role.STUDENT,
        point: {
          create: {},
        },
      },
    });
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    );
    return NextResponse.json(
      { message: "Confirmation email sent!" },
      { status: 201 }
    );
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
