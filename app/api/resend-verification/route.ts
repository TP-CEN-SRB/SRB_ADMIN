import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { ableToGenerateNewVerificationToken } from "@/utils/verificationToken";

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

    // 🔐 Do not reveal user existence or verification state
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    // ⏳ Cooldown check (single source of truth)
    const canResend = await ableToGenerateNewVerificationToken(normalizedEmail);
    if (!canResend) {
      return NextResponse.json(
        { error: "Please wait before requesting another verification email." },
        { status: 429 }
      );
    }

    // ✅ Generate fresh token (auto-clears old tokens)
    const token = await generateVerificationToken(normalizedEmail);

    await sendVerificationEmail(token.email, token.token);

    console.log(`[resend-verification] Sent new token to ${normalizedEmail}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[resend-verification] Unexpected error:", err);
    return NextResponse.json(
      { error: "Unable to resend verification email" },
      { status: 500 }
    );
  }
}
