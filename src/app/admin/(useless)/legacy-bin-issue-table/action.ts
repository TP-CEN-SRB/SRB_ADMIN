"use server"

import { prisma } from "@/lib/db"
import { BinStatus } from "@/generated/prisma"
import { revalidatePath } from "next/cache"

export const updateBinStatus = async (id: string, status: BinStatus) => {
  try {
    await prisma.bin.update({
      where: { id },
      data: { status },
    })

    revalidatePath("/admin") // Refresh dashboard after update
    return { success: `Bin status updated successfully (ID: ${id})` }
  } catch (error) {
    console.error("updateBinStatus error:", error)
    return { error: "Failed to update bin status" }
  }
}
