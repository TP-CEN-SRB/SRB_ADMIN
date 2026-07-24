import { prisma } from "@/lib/db"
import { utapi } from "@/lib/uploadthing"
import type { Prisma } from "@/generated/prisma"

const extractFileKey = (url: string) => url.split("/f/").pop()

export async function deleteDisposalImages(where: Prisma.DisposalWhereInput, take?: number) {
  const disposals = await prisma.disposal.findMany({
    where: { ...where, imageUrl: { not: null } },
    select: { id: true, imageUrl: true },
    take,
  })

  if (disposals.length === 0) {
    return { deletedCount: 0 }
  }

  const fileKeys = disposals
    .map((d) => extractFileKey(d.imageUrl!))
    .filter((key): key is string => !!key)

  if (fileKeys.length > 0) {
    await utapi.deleteFiles(fileKeys)
  }

  await prisma.disposal.updateMany({
    where: { id: { in: disposals.map((d) => d.id) } },
    data: { imageUrl: null },
  })

  return { deletedCount: disposals.length }
}
