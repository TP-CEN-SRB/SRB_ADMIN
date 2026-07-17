"use server"

import { prisma } from "@/lib/db"
import { BinMaterialSchema } from "@/schemas"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { cached, invalidateByPrefix, CATALOG_TTL } from "@/lib/cache"

const CACHE_PREFIX = "cache:bin-materials:"

export const getBinMaterials = async () => {
  return cached(`${CACHE_PREFIX}list`, CATALOG_TTL, () =>
    prisma.binMaterial.findMany()
  )
}

export const getBinMaterialById = async (id: string) => {
  return cached(`${CACHE_PREFIX}${id}`, CATALOG_TTL, () =>
    prisma.binMaterial.findUnique({
      where: {
        id,
      },
    })
  )
}

export const createBinMaterial = async (
  values: z.infer<typeof BinMaterialSchema>
) => {
  const validatedFields = BinMaterialSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }
  const formData = validatedFields.data
  const checkExistingBinMaterial = await prisma.binMaterial.findUnique({
    where: {
      name: formData.name.toUpperCase(),
    },
  })
  if (!checkExistingBinMaterial) {
    try {
      await prisma.binMaterial.create({
        data: {
          name: formData.name.toUpperCase(),
          multiplier: formData.multiplier,
        },
      })
      await invalidateByPrefix(CACHE_PREFIX)
      revalidatePath("/admin/bin/material")
      return { success: "Bin Material created successfully" }
    } catch (error) {
      return { error: "Failed to create Bin Material" }
    }
  } else return { error: "Bin Material already exists" }
}

export const updateBinMaterial = async (
  id: string,
  values: z.infer<typeof BinMaterialSchema>
) => {
  const validatedFields = BinMaterialSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Invalid fields" }
  }
  const formData = validatedFields.data
  const checkExistingBinMaterial = await prisma.binMaterial.findUnique({
    where: {
      id,
    },
  })
  if (checkExistingBinMaterial) {
    const checkMaterialWithSimilarRecord = await checkExistingMaterialRecord(
      id,
      formData.name.toUpperCase()
    )
    if (!checkMaterialWithSimilarRecord) {
      try {
        await prisma.binMaterial.update({
          where: {
            id,
          },
          data: {
            name: formData.name.toUpperCase(),
            multiplier: formData.multiplier,
          },
        })
        await invalidateByPrefix(CACHE_PREFIX)
        revalidatePath("/admin/bin/material")
        return { success: "Bin Material updated successfully" }
      } catch (error) {
        return { error: "Failed to update Bin Material" }
      }
    } else
      return {
        error: "Duplicate found. Material already exists",
      }
  } else return { error: "Bin Material does not exist" }
}

export const deleteBinMaterial = async (id: string) => {
  const checkExistingBinMaterial = await prisma.binMaterial.findUnique({
    where: {
      id,
    },
  })
  if (checkExistingBinMaterial) {
    try {
      await prisma.binMaterial.delete({
        where: {
          id,
        },
      })
      await invalidateByPrefix(CACHE_PREFIX)
      revalidatePath("/admin/bin/material")
      return { success: "Bin Material deleted successfully" }
    } catch (error) {
      return { error: "Failed to delete Bin Material" }
    }
  } else return { error: "Bin Material does not exist" }
}

const checkExistingMaterialRecord = async (id: string, name: string) => {
  const binMaterial = await prisma.binMaterial.findFirst({
    where: {
      id: { not: id },
      name,
    },
  })
  return binMaterial !== null
}

export const getAllBinsWithMaterial = async (id: string) => {
  const bins = await prisma.bin.findMany({
    where: {
      binMaterialId: id,
    },
  })
  return bins
}

export const getAllMaterials = async () => {
  return cached(`${CACHE_PREFIX}list`, CATALOG_TTL, () =>
    prisma.binMaterial.findMany()
  )
}
