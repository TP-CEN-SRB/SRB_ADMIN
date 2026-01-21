import { v4 as uuidv4 } from "uuid";
import prisma from "./db";

/**
 * Generate (or regenerate) an email verification token
 */
export const generateVerificationToken = async (
  email: string,
  oldEmail?: string
) => {
  const token = uuidv4();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // 🔥 Clear ALL old verification tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { email },
  });

  return prisma.verificationToken.create({
    data: {
      email,
      oldEmail,
      token,
      expires,
    },
  });
};

/**
 * Generate (or regenerate) a password reset token
 */
export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // 🔥 Clear ALL old reset tokens for this email
  await prisma.passswordResetToken.deleteMany({
    where: { email },
  });

  return prisma.passswordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });
};
