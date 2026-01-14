"use server";

import prisma from "@/lib/db";
import { getVerificationTokenByToken } from "@/utils/verificationToken";
import { decodeBase64UrlSafe } from "@/lib/tokenEncoding";

const verifyToken = async (token: string) => {
  if (!token) {
    return { error: "Invalid or missing verification link." };
  }

  // ✅ Decode ONLY if token is encoded (UUIDs contain "-")
  const finalToken = token.includes("-")
    ? token
    : decodeBase64UrlSafe(token);

  if (!finalToken) {
    return { error: "Invalid verification link." };
  }

  const existingToken = await getVerificationTokenByToken(finalToken);

  if (!existingToken) {
    return { error: "This verification link is invalid or has already been used." };
  }

  if (new Date(existingToken.expires) < new Date()) {
    return { error: "This verification link has expired." };
  }

  // 🔁 Email update flow
  if (existingToken.oldEmail) {
    try {
      await prisma.user.update({
        where: { email: existingToken.oldEmail.toLowerCase() },
        data: { email: existingToken.email.toLowerCase() },
      });

      await prisma.verificationToken.delete({
        where: { id: existingToken.id },
      });

      return { success: "Your email has been updated!" };
    } catch {
      return { error: "Failed to update email." };
    }
  }

  // ✅ Normal verification flow
  const user = await prisma.user.findUnique({
    where: { email: existingToken.email.toLowerCase() },
  });

  if (!user) {
    return { error: "User not found." };
  }

  // 🔥 VERIFY USER
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date() },
  });

  // 🔥 DELETE TOKEN IMMEDIATELY (prevents resend bugs)
  await prisma.verificationToken.delete({
    where: { id: existingToken.id },
  });

  // Optional extras (quests / events)
  try {
    const quests = await prisma.questDetails.findMany();
    if (quests.length) {
      await prisma.userQuest.createMany({
        data: quests.map((q) => ({
          userId: user.id,
          questId: q.id,
          progress: 0,
          isCompleted: false,
        })),
        skipDuplicates: true,
      });
    }
  } catch {}

  try {
    const now = new Date();
    const event = await prisma.event.findFirst({
      where: { startDate: { lte: now }, endDate: { gte: now } },
    });

    if (event) {
      await prisma.userEvent.create({
        data: { userId: user.id, eventId: event.id, points: 0 },
      }).catch(() => {});
    }
  } catch {}

  return {
    success: "Your email has been verified successfully.",
  };
};

export { verifyToken };