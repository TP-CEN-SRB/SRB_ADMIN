import prisma from "@/lib/db";

export const generateRandomQuests = async () => {
  const templates = await prisma.questTemplate.findMany();

  const questsToCreate = templates
    .sort(() => Math.random() - 0.5)
    .slice(0, 3) // create 3 random quests
    .map((template) => ({
      title: template.title,
      description: template.description,
      target: template.target,
      rewardPoints: template.rewardPoints,
      materialType: template.materialType,
      duration: 7,
    }));

  const created = await prisma.questDetails.createMany({
    data: questsToCreate,
  });

  return questsToCreate;
};