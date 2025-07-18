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

  // ✅ Email update case
  if (existingToken.oldEmail) {
    await prisma.user.update({
      where: { email: existingToken.oldEmail },
      data: { email: existingToken.email },
    });

    await prisma.verificationToken.delete({
      where: { id: existingToken.id },
    });

    return { success: "Your email has been updated!" };
  }

  // ✅ Normal email verification
  const existingUser = await prisma.user.findUnique({
    where: { email: existingToken.email },
  });

  if (!existingUser) return { error: "Something went wrong!" };

  const verifiedUser = await prisma.user.update({
    where: {
      id: existingUser.id,
    },
    data: {
      emailVerified: new Date(),
      email: existingToken.email, // needed when user updates email in settings
    },
  });

  // ✅ Assign all quests after verification
  const allQuests = await prisma.questDetails.findMany();

  if (allQuests.length > 0) {
    await prisma.userQuest.createMany({
      data: allQuests.map((quest) => ({
        userId: verifiedUser.id,
        questId: quest.id,
        progress: 0,
        isCompleted: false,
      })),
      skipDuplicates: true, // avoid duplicates if somehow already added
    });
  }

  await prisma.verificationToken.delete({
    where: { id: existingToken.id },
  });

  return { success: "Your email has been verified and quests assigned!" };
};

export { verifyToken };
