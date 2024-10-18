import prisma from "@/lib/db";

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
