"use server"
import { prisma } from "@/lib/db"
import { RewardSchema } from "@/schemas"
import { utapi } from "@/server/uploadthing"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

// form action needed to pass file type as a parameter to server action
const createReward = async (formData: FormData) => {
    const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (!user || user.role !== "ADMIN") {
    return { error: "Unauthorized access!" }
  }
  const data: Record<string, string | number | boolean | File> =
    Object.fromEntries(formData.entries())
  if (data.isCustomDateRange === "true") {
    const jsonDate = JSON.parse(data.dates as string)
    data.dates = jsonDate
  }
  data.isAvailable = data.isAvailable === "true"
  data.isExistingImage = data.isExistingImage === "true"
  data.isCustomDateRange = data.isCustomDateRange === "true"
  const validatedFields = RewardSchema.safeParse(data)
  if (!validatedFields.success) {
    return { error: validatedFields.error }
  }
  let image, from, to
  const {
    name,
    pointsRequired,
    description,
    isAvailable,
    isCustomDateRange,
    isExistingImage,
  } = validatedFields.data
  if (isCustomDateRange) {
    from = validatedFields.data.dates.from
    to = validatedFields.data.dates.to
  }
  if (!isExistingImage) {
    image = validatedFields.data.image
  }
  const existingReward = await prisma.reward.findUnique({
    where: {
      name: name,
    },
  })
  if (existingReward) {
    return { error: "Reward already exists!" }
  }
  const res = await utapi.uploadFiles(image as File)
  if (res.error) {
    return { error: "Unable to upload image!" }
  }
  await prisma.reward.create({
    data: {
      name,
      pointsRequired,
      description,
      isAvailable,
      image: res.data.appUrl,
      startDate: from ?? null,
      endDate: to ?? null,
    },
  })
  revalidatePath("/admin/reward")
  return {
    success: "Reward created successfully!",
  }
}

const updateReward = async (id: string, formData: FormData) => {
    const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (!user || user.role !== "ADMIN") {
    return { error: "Unauthorized access!" }
  }
  const data: Record<string, string | number | boolean | File> =
    Object.fromEntries(formData.entries())
  if (data.isCustomDateRange === "true") {
    const jsonDate = JSON.parse(data.dates as string)
    data.dates = jsonDate
  }
  data.isAvailable = data.isAvailable === "true"
  data.isExistingImage = data.isExistingImage === "true"
  data.isCustomDateRange = data.isCustomDateRange === "true"
  const validatedFields = RewardSchema.safeParse(data)
  if (!validatedFields.success) {
    return { error: validatedFields.error }
  }
  let image, from, to
  const {
    name,
    pointsRequired,
    description,
    isAvailable,
    isCustomDateRange,
    isExistingImage,
  } = validatedFields.data
  if (isCustomDateRange) {
    from = validatedFields.data.dates.from
    to = validatedFields.data.dates.to
  }
  if (!isExistingImage) {
    image = validatedFields.data.image
  }
  const existingReward = await prisma.reward.findFirst({
    where: { name: name, id: { not: id } },
  })
  if (existingReward) {
    return { error: "Reward with the same name already exists!" }
  }
  const currentReward = await prisma.reward.findUnique({
    where: {
      id: id,
    },
  })
  if (!currentReward) {
    return { error: "Reward does not exist!" }
  }
  if (!isExistingImage && image !== undefined) {
    const deleteRes = await utapi.deleteFiles(
      currentReward.image.split("/").pop() as string
    )
    if (!deleteRes.success) {
      return { error: "Unable to delete image!" }
    }
    const createRes = await utapi.uploadFiles(image as File)
    if (createRes.error) {
      return { error: "Unable to upload image!" }
    }
    const updatedReward = await prisma.reward.update({
      where: {
        id: currentReward.id,
      },
      data: {
        name,
        pointsRequired,
        description,
        isAvailable,
        image: createRes.data.appUrl,
        startDate: from ?? null,
        endDate: to ?? null,
      },
    })
    revalidatePath("/admin/reward")
    return { success: `Reward ${updatedReward.id} updated successfully` }
  }
  const updatedReward = await prisma.reward.update({
    where: {
      id: currentReward.id,
    },
    data: {
      name,
      pointsRequired,
      description,
      isAvailable,
      ...(from !== undefined ? { startDate: from } : { startDate: null }),
      ...(to !== undefined ? { endDate: to } : { endDate: null }),
    },
  })
  revalidatePath("/admin/reward")
  return { success: `Reward ${updatedReward.id} updated successfully ` }
}

const deleteReward = async (id: string) => {
    const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (!user || user.role !== "ADMIN") {
    return { error: "Unauthorized access!" }
  }
  const reward = await prisma.reward.findUnique({
    where: {
      id,
    },
  })
  if (!reward) {
    return { error: "Reward not found" }
  }
  const deleteRes = await utapi.deleteFiles(
    reward.image.split("/").pop() as string
  )
  if (!deleteRes.success) {
    return { error: "Unable to delete image!" }
  }
  const deletedReward = await prisma.reward.delete({
    where: {
      id,
    },
  })
  if (!deletedReward) {
    return { error: "Failed to delete reward" }
  }
  revalidatePath("/admin/reward")
  return { success: `Reward ${deletedReward.id} deleted successfully` }
}
export { createReward, updateReward, deleteReward }
