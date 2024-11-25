"use server";
import prisma from "@/lib/db";
import { RewardSchema } from "@/schemas";
import { utapi } from "@/server/uploadthing";
import { getSessionUser } from "@/utils/getAuth";

// form action needed to pass file type as a parameter to server action
export const createReward = async (formData: FormData) => {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Unauthorized access!" };
  }
  const data: Record<string, any> = Object.fromEntries(formData.entries());
  if (data.isCustomDateRange === "true") {
    const jsonDate = JSON.parse(data.dates as string);
    data.dates = jsonDate;
  }
  data.isExistingImage = data.isExistingImage === "true";
  data.isCustomDateRange = data.isCustomDateRange === "true";
  const validatedFields = RewardSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: validatedFields.error };
  }
  let image, from, to;
  const {
    name,
    pointsRequired,
    description,
    isCustomDateRange,
    isExistingImage,
  } = validatedFields.data;
  if (isCustomDateRange) {
    from = validatedFields.data.dates.from;
    to = validatedFields.data.dates.to;
  }
  if (!isExistingImage) {
    image = validatedFields.data.image;
  }
  const existingReward = await prisma.reward.findUnique({
    where: {
      name: name,
    },
  });
  if (existingReward) {
    return { error: "Reward already exists!" };
  }
  const res = await utapi.uploadFiles(image as File);
  if (res.error) {
    return { error: "Unable to upload image!" };
  }
  await prisma.reward.create({
    data: {
      name,
      pointsRequired,
      description,
      image: res.data.appUrl,
      startDate: from ?? null,
      endDate: to ?? null,
    },
  });
  return {
    success: "Reward created successfully!",
  };
};

export const updateReward = async (id: string, formData: FormData) => {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Unauthorized access!" };
  }
  const data: Record<string, any> = Object.fromEntries(formData.entries());
  if (data.isCustomDateRange === "true") {
    const jsonDate = JSON.parse(data.dates as string);
    data.dates = jsonDate;
  }
  data.isExistingImage = data.isExistingImage === "true";
  data.isCustomDateRange = data.isCustomDateRange === "true";
  const validatedFields = RewardSchema.safeParse(data);
  if (!validatedFields.success) {
    return { error: validatedFields.error };
  }
  let image, from, to;
  const {
    name,
    pointsRequired,
    description,
    isCustomDateRange,
    isExistingImage,
  } = validatedFields.data;
  if (isCustomDateRange) {
    from = validatedFields.data.dates.from;
    to = validatedFields.data.dates.to;
  }
  if (!isExistingImage) {
    image = validatedFields.data.image;
  }
  const existingReward = await prisma.reward.findFirst({
    where: { name: name, id: { not: id } },
  });
  if (existingReward) {
    return { error: "Reward with the same name already exists!" };
  }
  const currentReward = await prisma.reward.findUnique({
    where: {
      id: id,
    },
  });
  if (!currentReward) {
    return { error: "Reward does not exist!" };
  }
  if (!isExistingImage && image !== undefined) {
    const deleteRes = await utapi.deleteFiles(
      currentReward.image.split("/").pop() as string
    );
    if (!deleteRes.success) {
      return { error: "Unable to delete image!" };
    }
    const createRes = await utapi.uploadFiles(image as File);
    if (createRes.error) {
      return { error: "Unable to upload image!" };
    }
    const updatedReward = await prisma.reward.update({
      where: {
        id: currentReward.id,
      },
      data: {
        name,
        pointsRequired,
        description,
        image: createRes.data.appUrl,
        startDate: from ?? null,
        endDate: to ?? null,
      },
    });
    return { success: `Reward ${updatedReward.id} successfully updated` };
  }
  const updatedReward = await prisma.reward.update({
    where: {
      id: currentReward.id,
    },
    data: {
      name,
      pointsRequired,
      description,
      ...(from !== undefined ? { startDate: from } : { startDate: null }),
      ...(to !== undefined ? { endDate: to } : { endDate: null }),
    },
  });
  return { success: `Reward ${updatedReward.id}successfully updated` };
};
