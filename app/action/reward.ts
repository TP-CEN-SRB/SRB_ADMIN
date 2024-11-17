"use server";
import prisma from "@/lib/db";
import { RewardSchema } from "@/schemas";
import { utapi } from "@/server/uploadthing";
import { getSessionUser } from "@/utils/getAuth";

// form action needed to pass file type as a parameter to server action
export async function createReward(
  formData: FormData,
  isCustomDuration: boolean
) {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Unauthorized access!" };
  }
  const data = Object.fromEntries(formData.entries());
  if (isCustomDuration) {
    const jsonDate = JSON.parse(data.dates as string);
    data.dates = jsonDate;
    const validatedFields = RewardSchema.safeParse(data);

    if (!validatedFields.success) {
      return { error: validatedFields.error };
    }
    const { name, pointsRequired, description, image, dates } =
      validatedFields.data;

    const existingReward = await prisma.reward.findUnique({
      where: {
        name: name,
      },
    });
    if (existingReward) {
      return { error: "Reward already exists!" };
    }
    const res = await utapi.uploadFiles(image);
    if (res.error) {
      return { error: "Unable to upload image!" };
    }
    await prisma.reward.create({
      data: {
        name,
        pointsRequired,
        description,
        image: res.data.appUrl,
        startDate: dates.from,
        endDate: dates.to,
      },
    });
  } else {
    const validatedFields = RewardSchema.omit({ dates: true }).safeParse(data);

    if (!validatedFields.success) {
      return { error: validatedFields.error };
    }
    const { name, pointsRequired, description, image } = validatedFields.data;

    const existingReward = await prisma.reward.findUnique({
      where: {
        name: name,
      },
    });
    if (existingReward) {
      return { error: "Reward already exists!" };
    }
    const res = await utapi.uploadFiles(image);
    if (res.error) {
      return { error: "Unable to upload image!" };
    }
    await prisma.reward.create({
      data: {
        name,
        pointsRequired,
        description,
        image: res.data.appUrl,
      },
    });
  }

  return {
    success: "Reward created successfully!",
  };
}
