"use server"

import { prisma } from "@/lib/db"

export const checkExistingBinRecord = async (
  binLocation: string,
  binStatus: "FUNCTIONAL" | "UNDER_MAINTENANCE",
  binMaterialId: string,
  userId?: string
) => {
  const bin = await prisma.bin.findFirst({
    where: {
      binMaterialId,
      user: {
        location: binLocation,
        id: userId || undefined,
      },
      status: binStatus,
    },
    include: {
      user: {
        select: {
          location: true,
        },
      },
    },
  })

  return bin !== null
}
