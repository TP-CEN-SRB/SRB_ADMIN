"use server"

import { prisma } from "@/lib/db"

export async function getBinManagersWithBins() {
  return prisma.user.findMany({
    where: { role: "BIN" },
    select: {
      id: true,
      name: true,
      location: true,
      bins: {
        select: {
          id: true,
          status: true,
          currentCapacity: true,
          binMaterial: { select: { name: true } },
        },
        orderBy: { binMaterial: { name: "asc" } },
      },
    },
    orderBy: { name: "asc" },
  })
}
