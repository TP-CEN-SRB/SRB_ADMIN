import prisma from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import { SignUpStudentSchema } from "@/schemas/auth";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { Faculty, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { encodeBase64UrlSafe } from "@/lib/tokenEncoding";

export const POST = async (req: NextRequest) => {
  try {
    // Destructure, then normalize email
    const {
      name,
      email: rawEmail,
      password,
      confirmPassword,
      faculty,
      diploma,
    } = await req.json();

    const email = String(rawEmail).toLowerCase().trim();

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Validate with normalized email
    const validatedFields = SignUpStudentSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      faculty: faculty as Faculty,
      diploma,
    });

    if (!validatedFields.success) {
      const errors = validatedFields.error.flatten();
      return NextResponse.json(
        { message: "Something went wrong", errors: errors.fieldErrors },
        { status: 400 }
      );
    }

    const data = validatedFields.data;

    // Uniqueness check uses normalized email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(data.password, 10);

    // Create the new user (email already lowercase)
    await prisma.user.create({
      data: {
        name: capitalizeFirstLetter(data.name),
        email: data.email,
        password: hashedPassword,
        faculty: data.faculty,
        diploma: data.diploma,
        role: Role.STUDENT,
        point: { create: {} },
      },
    });

    // Send verification email using normalized email
    const verificationToken = await generateVerificationToken(email);
    const safeToken = encodeBase64UrlSafe(verificationToken.token);
    await sendVerificationEmail(verificationToken.email, safeToken);

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
