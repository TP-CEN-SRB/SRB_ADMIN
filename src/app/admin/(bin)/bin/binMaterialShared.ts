"use server"

import { prisma } from "@/lib/db"
import { cached, CATALOG_TTL } from "@/lib/cache"

const CACHE_PREFIX = "cache:bin-materials:"

export const getBinMaterials = async function(){
  return cached(`${CACHE_PREFIX}list`, CATALOG_TTL, () =>
    prisma.binMaterial.findMany()
  )
}
