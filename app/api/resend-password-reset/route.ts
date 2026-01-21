// app/api/resend-password-reset/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";
import { ableToGenerateNewPasswordResetToken } from "@/utils/passwordResetToken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email;

    // 🔐 Always return success for invalid input
    if (!email) {
      return NextResponse.json({ success: true });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 🔐 Do not reveal user existence
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // ⏳ Cooldown check
    const canResend = await ableToGenerateNewPasswordResetToken(normalizedEmail);
    if (!canResend) {
      return NextResponse.json(
        { error: "Please wait before requesting another reset email." },
        { status: 429 }
      );
    }

    // ✅ Generate fresh token (clears old ones)
    const token = await generatePasswordResetToken(normalizedEmail);
    await sendPasswordResetEmail(token.email, token.token);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[resend-password-reset]", err);
    return NextResponse.json(
      { error: "Unable to resend reset email" },
      { status: 500 }
    );
  }
}