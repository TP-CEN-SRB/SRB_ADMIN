import { v4 as uuidv4 } from "uuid";
import prisma from "./db";

/**
 * Generate a SINGLE verification token per email
 * HARD GUARANTEE:
 * - Only one active verification token per email
 * - Old tokens are ALWAYS removed before creation
 */
export const generateVerificationToken = async (
  email: string,
  oldEmail?: string
) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 🔥 Absolute guarantee: no duplicate verification tokens
  await prisma.verificationToken.deleteMany({
    where: { email: normalizedEmail },
  });

  const token = uuidv4();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return prisma.verificationToken.create({
    data: {
      email: normalizedEmail,
      oldEmail,
      token,
      expires,
    },
  });
};

/**
 * Generate a SINGLE password reset token per email
 * HARD GUARANTEE:
 * - Only one active reset token per email
 * - Old tokens are ALWAYS removed before creation
 */
export const generatePasswordResetToken = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 🔥 Prevent multiple valid reset links
  await prisma.passswordResetToken.deleteMany({
    where: { email: normalizedEmail },
  });

  const token = uuidv4();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return prisma.passswordResetToken.create({
    data: {
      email: normalizedEmail,
      token,
      expires,
    },
  });
};
