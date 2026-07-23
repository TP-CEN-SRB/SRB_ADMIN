"use server"

import { prisma } from "@/lib/db"
import { BinSchema } from "@/schemas"
import { BinStatus } from "@/generated/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { checkExistingBinRecord } from "../../binShared"
import { invalidateDashboardCache } from "@/app/action/dashboard"

export const createBin = async (
  values: z.infer<typeof BinSchema>,
  binUserId: string
) => {
  const validatedFields = BinSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid fields!" }
  }
  const formData = validatedFields.data
  for (let i = 0; i < formData.materialIds.length; i++) {
    const checkBinWithSimilarRecord = await checkExistingBinRecord(
      formData.location,
      formData.status,
      formData.materialIds[i],
      binUserId
    )
    if (checkBinWithSimilarRecord) {
      return {
        error: "Duplicate found. A bin of similar properties already exists",
      }
    }
    try {
      await prisma.bin.create({
        data: {
          status: formData.status as BinStatus,
          binMaterialId: formData.materialIds[i] as string,
          userId: binUserId,
          lastHeartBeat: null,
        },
      })
      if (i == formData.materialIds.length - 1) {
        try {
          await prisma.user.update({
            where: { id: binUserId },
            data: { location: formData.location },
          })
        } catch (error) {
          return { error: "Failed to update user location" }
        }
        await invalidateDashboardCache()
        revalidatePath("/admin/bin")
        revalidatePath("/admin/bin/manager")
        revalidatePath("/admin/bin/manager/map")
        revalidatePath("/admin/bin/manager/view/[id]", "page")
        revalidatePath("/admin/bin/manager/[id]", "page")
        return {
          success: `Bin created successfully, Location: ${formData.location}`,
        }
      }
    } catch (error) {
      return {
        error: "Unexpected Error occurred, Failed to create bin",
      }
    }
  }
}
