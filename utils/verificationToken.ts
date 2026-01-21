import prisma from "@/lib/db";

const MINIMUM_RESEND_INTERVAL_MS = 1 * 60 * 1000; // 1 minute

export const getVerificationTokenByEmail = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  return prisma.verificationToken.findFirst({
    where: { email: normalizedEmail },
    orderBy: { createdAt: "desc" },
  });
};

export const getVerificationTokenByToken = async (token: string) => {
  return prisma.verificationToken.findUnique({
    where: { token },
  });
};

export const ableToGenerateNewVerificationToken = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();

  const latestToken = await prisma.verificationToken.findFirst({
    where: { email: normalizedEmail },
    orderBy: { createdAt: "desc" },
  });

  if (!latestToken) return true;

  if (new Date(latestToken.expires) < new Date()) return true;

  const timeSinceLastEmail =
    Date.now() - new Date(latestToken.createdAt).getTime();

  return timeSinceLastEmail >= MINIMUM_RESEND_INTERVAL_MS;
};
