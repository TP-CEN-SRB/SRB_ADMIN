import prisma from "@/lib/db";
const MINIMUM_RESEND_INTERNVAL_MS = 1 * 60 * 1000; // 1 minutes

export const getVerificationTokenByEmail = async (email: string) => {
  const verficationToken = await prisma.verificationToken.findFirst({
    where: {
      email: email,
    },
  });
  if (!verficationToken) return null;
  return verficationToken;
};

export const getVerificationTokenByToken = async (token: string) => {
  const verficationToken = await prisma.verificationToken.findUnique({
    where: {
      token: token,
    },
  });
  if (!verficationToken) return null;
  return verficationToken;
};

export const ableToGenerateNewVerificationToken = async (email: string) => {
  const existingToken = await prisma.verificationToken.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" },
  });

  if (!existingToken) return true;

  const timeSinceLastEmail =
    Date.now() - new Date(existingToken.createdAt).getTime();

  return timeSinceLastEmail >= MINIMUM_RESEND_INTERNVAL_MS;
};
