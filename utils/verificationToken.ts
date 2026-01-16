import prisma from "@/lib/db";

const MINIMUM_RESEND_INTERVAL_MS = 1 * 60 * 1000; // 1 minute

export const getVerificationTokenByEmail = async (email: string) => {
  return prisma.verificationToken.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
};


export const getVerificationTokenByToken = async (token: string) => {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  return verificationToken ?? null;
};

export const ableToGenerateNewVerificationToken = async (email: string) => {
  const latestToken = await prisma.verificationToken.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!latestToken) return true;

  // ✅ If token already expired, allow resend immediately
  if (new Date(latestToken.expires) < new Date()) {
    return true;
  }

  const timeSinceLastEmail =
    Date.now() - new Date(latestToken.createdAt).getTime();

  return timeSinceLastEmail >= MINIMUM_RESEND_INTERVAL_MS;
};