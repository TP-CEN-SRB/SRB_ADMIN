"use server"

import { prisma } from "@/lib/db"

// Giant Rubbish Bin (GRB) weight readings - a single standalone bin reporting
// over the public HiveMQ broker (see src/lib/grbMqtt.ts), independent of the
// per-user smart bins in src/app/action/bin.ts.

export const recordGrbWeight = async (weightInGrams: number) => {
  if (!Number.isFinite(weightInGrams) || weightInGrams < 0) {
    console.warn("⚠️ Ignored invalid GRB weight reading:", weightInGrams)
    return { error: "Invalid weight" }
  }

  const log = await prisma.grbWeightLog.create({
    data: { weightInGrams: Math.round(weightInGrams) },
    select: { id: true, weightInGrams: true, createdAt: true },
  })

  return { success: true, log }
}

export const getLatestGrbWeight = async () => {
  return prisma.grbWeightLog.findFirst({
    orderBy: { createdAt: "desc" },
    select: { weightInGrams: true, createdAt: true },
  })
}
