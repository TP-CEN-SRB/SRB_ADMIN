import { v4 as uuidv4 } from "uuid";
import prisma from "./db";
import { getPasswordResetTokenByEmail } from "@/utils/passwordResetToken";

/**
 * Generate (or regenerate) an email verification token
 */
export const generateVerificationToken = async (
  email: string,
  oldEmail?: string
) => {
  const token = uuidv4();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // 🔥 ALWAYS remove all old tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { email },
  });

  const verificationToken = await prisma.verificationToken.create({
    data: {
      email,
      oldEmail,
      token,
      expires,
    },
  });

  return verificationToken;
};

/**
 * Generate (or regenerate) a password reset token
 */
export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // 🔥 Clear old reset tokens
  await prisma.passswordResetToken.deleteMany({
    where: { email },
  });

  const passwordResetToken = await prisma.passswordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return passwordResetToken;
};
