import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import {
  ableToGenerateNewVerificationToken,
  getVerificationTokenByEmail,
} from "@/utils/verificationToken";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: true });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 🔐 Do not reveal anything
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    const existingToken = await getVerificationTokenByEmail(normalizedEmail);

    // ⏳ Cooldown check
    if (existingToken) {
      const canResend = await ableToGenerateNewVerificationToken(normalizedEmail);
      if (!canResend) {
        return NextResponse.json(
          { error: "Please wait before requesting another verification email." },
          { status: 429 }
        );
      }
    }

    // ✅ Generate fresh token (auto-clears old ones)
    const token = await generateVerificationToken(normalizedEmail);

    await sendVerificationEmail(token.email, token.token);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[resend-verification]", err);
    return NextResponse.json(
      { error: "Unable to resend verification email" },
      { status: 500 }
    );
  }
}