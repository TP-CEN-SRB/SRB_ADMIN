"use server";

import prisma from "@/lib/db";
import { getSessionUser } from "@/utils/getAuth";
import { QuestSchema, UpdateQuestSchema } from "@/schemas";
import { z } from "zod";

// Define return type
type Quest = {
  id: string;
  title: string;
  description: string;
  target: number;
  materialType: string;
  rewardPoints: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
};

type GetQuestsResult = {
  quests: Quest[];
  questCount: number;
};

export const createQuest = async (data: z.infer<typeof QuestSchema>) => {
  const user = await getSessionUser();

  if (user?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const now = new Date();
    const endDate = new Date(now.getTime() + data.duration * 24 * 60 * 60 * 1000); // ✅ dynamic

    const quest = await prisma.questDetails.create({
      data: {
        title: data.title,
        description: data.description,
        target: data.target,
        materialType: data.materialType,
        rewardPoints: data.rewardPoints,
        startDate: now,
        endDate: endDate, // ✅ use computed value
      },
    });

    return { success: "Quest created successfully", quest };
  } catch (error: any) {
    return { error: error.message || "Failed to create quest" };
  }
};

export const deleteQuest = async (questId: string) => {
  const user = await getSessionUser();

  if (user?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.questDetails.delete({
      where: { id: questId },
    });

    return { success: "Quest deleted successfully" };
  } catch (error: any) {
    return { error: error.message || "Failed to delete quest" };
  }
};

export const updateQuest = async (id: string, data: z.infer<typeof UpdateQuestSchema>) => {
  const user = await getSessionUser();

  if (user?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    const updated = await prisma.questDetails.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        target: data.target,
        materialType: data.materialType,
        rewardPoints: data.rewardPoints,
        updatedAt: new Date(), // optional if you want to explicitly set this
      },
    });

    return { success: "Quest updated successfully", quest: updated };
  } catch (error: any) {
    return { error: error.message || "Failed to update quest" };
  }
};

export const getQuestById = async (id: string) => {
  return await prisma.questDetails.findUnique({
    where: {
      id: id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      target: true,
      materialType: true,
      rewardPoints: true,
      startDate: true,
      endDate: true,
      createdAt: true,
    },
  });
};

export const getQuests = async (
  page: number | null,
  sortOrder: string | undefined,
  sortItem: string | undefined
): Promise<GetQuestsResult> => {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") {
    return { questCount: 0, quests: [] };
  }

  const sortableItems = ["title", "materialType", "target", "rewardPoints", "createdAt"];
  const isInvalidPage = page != null && page < 0;
  const isInvalidSortOrder = sortOrder && !["asc", "desc"].includes(sortOrder);
  const isInvalidSortItem = sortItem && !sortableItems.includes(sortItem);

  if (isInvalidPage || isInvalidSortOrder || isInvalidSortItem) {
    return { questCount: 0, quests: [] };
  }

  const [questCount, quests] = await Promise.all([
    prisma.questDetails.count(),
    prisma.questDetails.findMany({
      take: page ? 10 : undefined,
      skip: page ? (page - 1) * 10 : 0,
      orderBy: sortItem
        ? {
            [sortItem]: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc",
          }
        : { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        materialType: true,
        target: true,
        rewardPoints: true,
        startDate: true,
        endDate: true,
        createdAt: true,
      },
    }),
  ]);


  return { questCount, quests };
};
