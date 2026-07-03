"use server";

import { prisma } from "@/lib/db";
import { getSessionUser } from "@/utils/getAuth";
import { z } from "zod";
import { QuestSchema } from "@/schemas";

// Convert QuestSchema → only fields allowed for templates
const TemplateSchema = QuestSchema.pick({
  title: true,
  description: true,
  target: true,
  rewardPoints: true,
  materialType: true,
  duration: true,
});

// ---------- CREATE TEMPLATE ----------
export const createQuestTemplate = async (
  data: z.infer<typeof TemplateSchema>
) => {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const template = await prisma.questTemplate.create({
      data: {
        title: data.title,
        description: data.description,
        target: data.target,
        rewardPoints: data.rewardPoints,
        materialType: data.materialType,
        duration: data.duration,
      },
    });

    return { success: "Quest template created!", template };
  } catch (err) {
    return { error: "Failed to create template" };
  }
};

// ---------- GET ALL TEMPLATES ----------
export const getQuestTemplates = async () => {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") return [];

  return prisma.questTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
};

// ---------- GET TEMPLATE BY ID ----------
export const getQuestTemplateById = async (id: string) => {
  return prisma.questTemplate.findUnique({
    where: { id },
  });
};

// ---------- UPDATE TEMPLATE ----------
export const updateQuestTemplate = async (
  id: string,
  data: z.infer<typeof TemplateSchema>
) => {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    const updated = await prisma.questTemplate.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        target: data.target,
        rewardPoints: data.rewardPoints,
        materialType: data.materialType,
        duration: data.duration,
        updatedAt: new Date(),
      },
    });

    return { success: "Template updated!", updated };
  } catch (err) {
    return { error: "Failed to update template" };
  }
};

// ---------- DELETE TEMPLATE ----------
export const deleteQuestTemplate = async (id: string) => {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    await prisma.questTemplate.delete({ where: { id } });
    return { success: "Template deleted" };
  } catch (err) {
    return { error: "Failed to delete template" };
  }
};
