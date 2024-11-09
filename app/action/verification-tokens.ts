"use server";
import prisma from "@/lib/db";
import { getVerificationTokenByToken } from "@/utils/verificationToken";

const verifyToken = async (token: string) => {
  if (!token) return { error: "Something went wrong!" };
  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken)
    return {
      error: "Oops! This link may have already been used",
    };

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired)
    return {
      error: "Oops! This link has expired",
    };

  const existingUser = await prisma.user.findUnique({
    where: {
      email: existingToken.email,
    },
  });
  if (!existingUser) return { error: "Something went wrong!" };
  await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      emailVerified: new Date(),
      email: existingToken.email, // needed when user updates email in settings
    },
  });
  await prisma.verificationToken.delete({
    where: {
      id: existingToken.id,
    },
  });
  return { success: "Your email has been verified!" };
};



export { verifyToken };
