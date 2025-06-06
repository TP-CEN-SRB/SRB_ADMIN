"use server";
import prisma from "@/lib/db";

const MINIMUM_PUBLISH_INTERVAL = 5 * 1000; // 5 seconds

export const ableToPublishMqttMessage = async (userId: string) => {
  const binManager = await prisma.user.findUnique({ where: { id: userId } });
  if (!binManager) {
    return false;
  }
  if (binManager.commandUpdatedAt === null) {
    return true;
  }
  const timeSinceLastCommand =
    Date.now() - new Date(binManager.commandUpdatedAt).getTime();
  return timeSinceLastCommand >= MINIMUM_PUBLISH_INTERVAL;
};

export const updateCommandUpdatedAt = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { commandUpdatedAt: new Date() },
  });
};

export const resetCommandCooldown = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      commandUpdatedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    },
  });
};