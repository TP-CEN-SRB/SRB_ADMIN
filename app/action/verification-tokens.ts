"use server";
import prisma from "@/lib/db";
import { getVerificationTokenByToken } from "@/utils/verificationToken";
import { redirect } from "next/navigation";

const verifyToken = async (token: string) => {
  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken) return { error: "Token not found" };

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) return { error: "Token has expired" };

  const existingUser = await prisma.user.findUnique({
    where: {
      email: existingToken.email,
    },
  });
  if (!existingUser) return { error: "User not found" };
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
  redirect("/new-verification?success=true");
};

export { verifyToken };
