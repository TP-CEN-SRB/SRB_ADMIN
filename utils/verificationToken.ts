import prisma from "@/lib/db";

const MINIMUM_RESEND_INTERVAL_MS = 1 * 60 * 1000; // 1 minute

export const getVerificationTokenByEmail = async (email: string) => {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: { email },
  });

  return verificationToken ?? null;
};

export const getVerificationTokenByToken = async (token: string) => {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  return verificationToken ?? null;
};

export const ableToGenerateNewVerificationToken = async (email: string) => {
  const existingToken = await prisma.verificationToken.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!existingToken) return true;

  const timeSinceLastEmail =
    Date.now() - new Date(existingToken.createdAt).getTime();

  return timeSinceLastEmail >= MINIMUM_RESEND_INTERVAL_MS;
};