"use server";

import { prisma } from "@/lib/db";
import { getVerificationTokenByToken } from "@/utils/verificationToken";

export const verifyToken = async (token: string) => {
  if (!token) {
    return { error: "Invalid or missing verification link." };
  }

  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return { error: "This verification link is invalid or has already been used." };
  }

  if (new Date(existingToken.expires) < new Date()) {
    // optional cleanup: clear expired tokens for that email
    await prisma.verificationToken.deleteMany({ where: { email: existingToken.email } });
    return { error: "This verification link has expired." };
  }

  const email = existingToken.email.toLowerCase().trim();
  const oldEmail = existingToken.oldEmail?.toLowerCase().trim();

  // 🔁 Email update flow
  if (oldEmail) {
    const user = await prisma.user.findUnique({ where: { email: oldEmail } });
    if (!user) return { error: "User not found." };

    await prisma.$transaction([
      prisma.user.update({
        where: { email: oldEmail },
        data: { email },
      }),
      // 🔥 wipe ALL tokens for the new email (and optionally old email too)
      prisma.verificationToken.deleteMany({ where: { email } }),
      prisma.verificationToken.deleteMany({ where: { email: oldEmail } }),
    ]);

    return { success: "Your email has been updated!" };
  }

  // ✅ Normal verification flow
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "User not found." };

  // If already verified, still clean tokens so old links die
  if (user.emailVerified) {
    await prisma.verificationToken.deleteMany({ where: { email } });
    return { success: "Your email is already verified." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    // 🔥 wipe ALL tokens for that email
    prisma.verificationToken.deleteMany({ where: { email } }),
  ]);

  return { success: "Your email has been verified successfully." };
};
