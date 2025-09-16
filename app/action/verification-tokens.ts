"use server";

import prisma from "@/lib/db";
import { getVerificationTokenByToken } from "@/utils/verificationToken";
import { decodeBase64UrlSafe } from "@/lib/tokenEncoding";

const verifyToken = async (token: string) => {
  console.log("[verifyToken] === START VERIFICATION ===");
  console.log("[verifyToken] Received token (raw from URL):", token);

  if (!token) {
    console.warn("[verifyToken] No token received");
    return { error: "Something went wrong!" };
  }

  // Decode token (for Outlook-safe base64 URL tokens)
  const decodedToken = decodeBase64UrlSafe(token);
  console.log("[verifyToken] Decoded token (after decodeBase64UrlSafe):", decodedToken);

  if (!decodedToken) {
    console.warn("[verifyToken] Token could not be decoded");
    return { error: "Something went wrong!" };
  }

  // Check DB entry
  const existingToken = await getVerificationTokenByToken(decodedToken);
  console.log("[verifyToken] Token fetched from DB:", existingToken?.token || null);

  if (!existingToken) {
    console.warn("[verifyToken] Token not found in DB");
    return {
      error: "Oops! This link may have already been used",
    };
  }

  const hasExpired = new Date(existingToken.expires) < new Date();
  console.log("[verifyToken] Token expiration:", existingToken.expires, "Expired:", hasExpired);

  if (hasExpired) {
    console.warn("[verifyToken] Token has expired");
    return {
      error: "Oops! This link has expired",
    };
  }

  // Handle email update case
  if (existingToken.oldEmail) {
    console.log("[verifyToken] Detected email update from", existingToken.oldEmail, "to", existingToken.email);
    try {
      await prisma.user.update({
        where: { email: existingToken.oldEmail },
        data: { email: existingToken.email },
      });
      await prisma.verificationToken.delete({
        where: { id: existingToken.id },
      });
      console.log("[verifyToken] Email updated and token deleted");
      return { success: "Your email has been updated!" };
    } catch (err) {
      console.error("[verifyToken] Failed during email update:", err);
      return { error: "Something went wrong!" };
    }
  }

  // Normal email verification
  const existingUser = await prisma.user.findUnique({
  where: { email: existingToken.email.toLowerCase() }, // normalize casing
  });

  if (!existingUser) {
    console.warn("[verifyToken] No user found with email:", existingToken.email);
    return { error: "Something went wrong!" };
  }

  let verifiedUser;
  try {
    verifiedUser = await prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        emailVerified: new Date(),
        email: existingToken.email,
      },
    });
    console.log("[verifyToken] User verified:", verifiedUser.email);
  } catch (err) {
    console.error("[verifyToken] Failed to verify user:", err);
    return { error: "Something went wrong!" };
  }

  // Assign all quests
  try {
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
      console.log("[verifyToken] Assigned quests to user:", verifiedUser.email);
    }
  } catch (err) {
    console.error("[verifyToken] Failed to assign quests:", err);
  }

  // Assign currently ongoing event
  try {
    const now = new Date();
    const existingEvent = await prisma.event.findFirst({
      where: {
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    if (existingEvent) {
      const alreadyAssigned = await prisma.userEvent.findFirst({
        where: {
          userId: verifiedUser.id,
          eventId: existingEvent.id,
        },
      });

      if (!alreadyAssigned) {
        await prisma.userEvent.create({
          data: {
            userId: verifiedUser.id,
            eventId: existingEvent.id,
            points: 0,
          },
        });
        console.log("[verifyToken] Assigned ongoing event to user:", verifiedUser.email);
      } else {
        console.log("[verifyToken] User already assigned to current event");
      }
    } else {
      console.log("[verifyToken] No current event found");
    }
  } catch (err) {
    console.error("[verifyToken] Failed to assign current event:", err);
  }

  try {
    await prisma.verificationToken.delete({
      where: { id: existingToken.id },
    });
    console.log("[verifyToken] Deleted token after verification");
  } catch (err) {
    console.error("[verifyToken] Failed to delete verification token:", err);
  }

  console.log("[verifyToken] === END VERIFICATION ===");

  return {
    success: "Your email has been verified! Quests and current event assigned.",
  };
};

export { verifyToken };
