"use server";

import prisma from "@/lib/db";
import { getVerificationTokenByToken } from "@/utils/verificationToken";

// 🔐 Safe Base64URL decode to support Outlook-escaped links
function decodeBase64UrlSafe(token: string): string {
  try {
    const base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
    return Buffer.from(padded, "base64").toString("utf8");
  } catch (err) {
    console.error("[verifyToken] Failed to decode token:", err);
    return ""; // fallback will be triggered
  }
}

const verifyToken = async (incomingToken: string) => {
  if (!incomingToken) return { error: "Something went wrong!" };

  // 🧩 Try decoding — fallback to raw if it fails
  let token = decodeBase64UrlSafe(incomingToken);
  if (!token || token.trim() === "") token = incomingToken;

  const existingToken = await getVerificationTokenByToken(token);
  if (!existingToken) {
    return { error: "Oops! This link may have already been used" };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  if (hasExpired) {
    return { error: "Oops! This link has expired" };
  }

  // ✅ Email update (e.g. from settings)
  if (existingToken.oldEmail) {
    await prisma.user.update({
      where: { email: existingToken.oldEmail },
      data: { email: existingToken.email },
    });

    await prisma.verificationToken.delete({ where: { id: existingToken.id } });
    return { success: "Your email has been updated!" };
  }

  // ✅ Normal email verification
  const existingUser = await prisma.user.findUnique({
    where: { email: existingToken.email },
  });

  if (!existingUser) return { error: "Something went wrong!" };

  const verifiedUser = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      emailVerified: new Date(),
      email: existingToken.email,
    },
  });

  // 🏆 Assign all quests
  const allQuests = await prisma.questDetails.findMany();
  if (allQuests.length > 0) {
    await prisma.userQuest.createMany({
      data: allQuests.map((quest) => ({
        userId: verifiedUser.id,
        questId: quest.id,
        progress: 0,
        isCompleted: false,
      })),
      skipDuplicates: true,
    });
  }

  await prisma.verificationToken.delete({ where: { id: existingToken.id } });

  return { success: "Your email has been verified and quests assigned!" };
};

export { verifyToken };
