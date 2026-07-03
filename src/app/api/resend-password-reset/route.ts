// app/api/resend-password-reset/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/resend";
import { ableToGenerateNewPasswordResetToken } from "@/utils/passwordResetToken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email;
    const redirect = body?.redirect; // ✅ optional, future-proof

    // 🔐 Always return generic success for invalid input
    if (!email) {
      return NextResponse.json({ success: true, sent: false });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // 🔐 Do not reveal user existence
    if (!user) {
      return NextResponse.json({ success: true, sent: false });
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

    // ❗ IMPORTANT: this must throw if email fails
    await sendPasswordResetEmail(token.email, token.token, redirect);

    return NextResponse.json({
      success: true,
      sent: true,
    });
  } catch (err) {
    console.error("[resend-password-reset] Email send failed:", err);
    return NextResponse.json(
      { error: "Failed to send password reset email." },
      { status: 500 }
    );
  }
}