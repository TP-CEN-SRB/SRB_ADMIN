import { v4 as uuidv4 } from "uuid";
import prisma from "./db";

/**
 * Generate an email verification token
 *
 * IMPORTANT:
 * - This function MUST be pure.
 * - It MUST NOT delete old tokens.
 * - Cleanup happens AFTER a successful email send.
 */
export const generateVerificationToken = async (
  email: string,
  oldEmail?: string
) => {
  const token = uuidv4();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

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
 * Generate a password reset token
 *
 * IMPORTANT:
 * - Same rules as verification tokens
 * - DO NOT delete old tokens here
 * - Cleanup happens AFTER email is successfully sent
 */
export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  return prisma.passswordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });
};