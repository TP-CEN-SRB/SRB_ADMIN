"use server";
import prisma from "@/lib/db";
import { RewardSchema } from "@/schemas";
import { utapi } from "@/server/uploadthing";
import { getSessionUser } from "@/utils/getAuth";

// form action needed to pass file type as a parameter to server action
export async function createReward(formData: FormData) {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Unauthorized access!" };
  }
  const validatedFields = RewardSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const { name, pointsRequired, image } = validatedFields.data;

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
      image: res.data.appUrl,
    },
  });

  return {
    success: "Reward created successfully!",
  };
}
