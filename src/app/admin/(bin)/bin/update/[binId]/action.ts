"use server"

import { prisma } from "@/lib/db"
import { UpdateBinSchema } from "@/schemas"
import { BinStatus } from "@/generated/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { checkExistingBinRecord } from "../../binShared"
import { invalidateDashboardCache } from "@/app/action/dashboard"

export const getBinById = async (id: string) => {
  return await prisma.bin.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          location: true,
        },
      },
      binMaterial: {
        select: {
          name: true,
        },
      },
    },
  })
}

export const updateBin = async (
  id: string,
  values: z.infer<typeof UpdateBinSchema>
) => {
  const validatedFields = UpdateBinSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid fields!" }
  }
  const formData = validatedFields.data
  const checkIfBinExist = await prisma.bin.findUnique({
    where: { id },
  })
  if (!checkIfBinExist) {
    return { error: "Bin does not exist" }
  }
  const checkBinWithSimilarRecord = await checkExistingBinRecord(
    formData.location,
    formData.status,
    formData.materialId
  )
  if (checkBinWithSimilarRecord) {
    return {
      error: "Duplicate found. A bin of similar properties already exists",
    }
  } else {
    try {
      await Promise.all([
        prisma.bin.update({
          where: { id },
          data: {
            status: formData.status as BinStatus,
            binMaterialId: formData.materialId as string,
          },
        }),
        prisma.user.update({
          where: { id: checkIfBinExist.userId },
          data: {
            location: formData.location,
          },
        }),
      ])
      await invalidateDashboardCache()
      revalidatePath("/admin/bin")
      revalidatePath("/admin/bin/manager")
      revalidatePath("/admin/bin/manager/map")
      revalidatePath("/admin/bin/manager/view/[id]", "page")
      revalidatePath("/admin/bin/manager/[id]", "page")
      return {
        success: `Bin updated successfully, Bin ID: ${id}`,
      }
    } catch (error) {
      return {
        error: "Unexpected error occurred, Failed to update bin",
      }
    }
  }
}
