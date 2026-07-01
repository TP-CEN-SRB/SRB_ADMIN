import prisma from "@/lib/db";

const MINIMUM_RESEND_INTERVAL_MS = 1 * 60 * 1000; // 1 minute

export const getPasswordResetTokenByToken = async (token: string) => {
  return prisma.passswordResetToken.findUnique({
    where: { token },
  });
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  return prisma.passswordResetToken.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
};

export const ableToGenerateNewPasswordResetToken = async (email: string) => {
  const existingToken = await prisma.passswordResetToken.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!existingToken) return true;

  const timeSinceLastEmail =
    Date.now() - new Date(existingToken.createdAt).getTime();

  return timeSinceLastEmail >= MINIMUM_RESEND_INTERVAL_MS;
};