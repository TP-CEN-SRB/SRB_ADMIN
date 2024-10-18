import prisma from "@/lib/db";

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
