import prisma from "@/lib/db";
import { LoginSchema } from "@/schemas/auth";
import { Role } from "@prisma/client";
import { compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import {
  ableToGenerateNewVerificationToken,
  getVerificationTokenByEmail,
} from "@/utils/verificationToken";

export const POST = async (req: NextRequest) => {
  try {
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
      return NextResponse.json(
        { message: "Invalid Credentials" },
        { status: 404 }
      );
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
      const existingToken = await getVerificationTokenByEmail(
        existingUser.email
      );
      if (!existingToken) {
        const verificationToken = await generateVerificationToken(
          existingUser.email
        );
        await sendVerificationEmail(
          verificationToken.email,
          verificationToken.token
        );
        return NextResponse.json(
          { message: "Confirmation email sent!" },
          { status: 200 }
        );
      }
      const ableToResendEmail = await ableToGenerateNewVerificationToken(
        existingToken.token
      );
      if (!ableToResendEmail) {
        return NextResponse.json(
          {
            message:
              "We have already sent you an email! If you wish to resend please try again later",
          },
          {
            status: 403,
          }
        );
      }
      const verificationToken = await generateVerificationToken(
        existingUser.email
      );
      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );
      return NextResponse.json(
        { message: "Confirmation email sent!" },
        { status: 200 }
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
