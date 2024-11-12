import prisma from "@/lib/db";
const MINIMUM_RESEND_INTERNVAL_MS = 1 * 60 * 1000; // 1 minutes

export const getPasswordResetTokenByToken = async (token: string) => {
  const passwordResetToken = await prisma.passswordResetToken.findUnique({
    where: {
      token: token,
    },
  });
  if (!passwordResetToken) return null;
  return passwordResetToken;
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  const passwordResetToken = await prisma.passswordResetToken.findFirst({
    where: {
      email: email,
    },
  });
  if (!passwordResetToken) return null;
  return passwordResetToken;
};

export const ableToGenerateNewPasswordResetToken = async (token: string) => {
  const existingToken = await prisma.passswordResetToken.findUnique({
    where: { token: token },
  });
  if (!existingToken) {
    return true;
  }
  const timeSinceLastEmail =
    Date.now() - new Date(existingToken.createdAt).getTime();
  return timeSinceLastEmail >= MINIMUM_RESEND_INTERNVAL_MS; // returns true only if time passes the minimum interval
};
