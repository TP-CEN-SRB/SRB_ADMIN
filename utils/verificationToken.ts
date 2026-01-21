import prisma from "@/lib/db";

const MINIMUM_RESEND_INTERVAL_MS = 1 * 60 * 1000; // 1 minute

/**
 * Get the latest verification token for an email
 * ❌ MUST NOT delete anything
 */
export const getVerificationTokenByEmail = async (email: string) => {
  return prisma.verificationToken.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });
};

/**
 * Get verification token by token string
 */
export const getVerificationTokenByToken = async (token: string) => {
  return prisma.verificationToken.findUnique({
    where: { token },
  });
};

/**
 * Check if user is allowed to request a new verification email
 * ❌ MUST NOT delete anything
 */
export const ableToGenerateNewVerificationToken = async (email: string) => {
  const latestToken = await prisma.verificationToken.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  // No previous token → allowed
  if (!latestToken) return true;

  // Expired token → allowed
  if (new Date(latestToken.expires) < new Date()) {
    return true;
  }

  const timeSinceLastEmail =
    Date.now() - new Date(latestToken.createdAt).getTime();

  return timeSinceLastEmail >= MINIMUM_RESEND_INTERVAL_MS;
};