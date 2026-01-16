"use server";

import prisma from "@/lib/db";
import { getVerificationTokenByToken } from "@/utils/verificationToken";

const verifyToken = async (token: string) => {
  if (!token) {
    return { error: "Invalid or missing verification link." };
  }

  // 🔒 NO decoding. NO guessing.
  const existingToken = await getVerificationTokenByToken(token);

  if (!existingToken) {
    return {
      error: "This verification link is invalid or has already been used.",
    };
  }

  if (new Date(existingToken.expires) < new Date()) {
    return { error: "This verification link has expired." };
  }

  // 🔁 Email update flow
  if (existingToken.oldEmail) {
    try {
      await prisma.user.update({
        where: { email: existingToken.oldEmail.toLowerCase().trim() },
        data: { email: existingToken.email.toLowerCase().trim() },
      });

      await prisma.verificationToken.delete({
        where: { id: existingToken.id },
      });

      return { success: "Your email has been updated!" };
    } catch {
      return { error: "Failed to update email." };
    }
  }

  // ✅ Normal verification
  const user = await prisma.user.findUnique({
    where: { email: existingToken.email.toLowerCase().trim() },
  });

  if (!user) {
    return { error: "User not found." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  // 🔥 Delete token immediately
  await prisma.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Your email has been verified successfully." };
};

export { verifyToken };