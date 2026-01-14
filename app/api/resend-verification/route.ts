import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 🔐 Do NOT reveal whether email exists
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    // ❌ delete old tokens
    await prisma.verificationToken.deleteMany({
      where: { email },
    });

    // ✅ generate new token
    const token = await generateVerificationToken(email);

    await sendVerificationEmail(email, token.token);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to resend verification email" },
      { status: 500 }
    );
  }
}
