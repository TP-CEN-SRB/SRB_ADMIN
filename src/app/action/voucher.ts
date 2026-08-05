"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { VoucherSchema, UpdateVoucherSchema } from "@/schemas"
import { utapi } from "@/lib/uploadthing"
import { z } from "zod"

// Reward.image is a required column read by both the admin table and the
// mobile app's /api/reward endpoint, so a voucher created without an upload
// still needs a real, always-reachable URL rather than null/empty - this is
// served from this app's own public/ folder, same origin as BETTER_AUTH_URL.
const DEFAULT_VOUCHER_IMAGE_URL = `${process.env.BETTER_AUTH_URL ?? "https://cen-smart-bin.vercel.app"}/recycling.png`

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user?.role === "admin"
}

// Create Voucher
const createVoucher = async (values: z.infer<typeof VoucherSchema>) => {
  if (!(await requireAdmin())) {
    return { error: "Unauthorized access!" }
  }

  const validated = VoucherSchema.safeParse(values)
  if (!validated.success) {
    return { error: "Invalid fields", fieldErrors: validated.error.flatten().fieldErrors }
  }

  const { name, pointsRequired, description, isAvailable, image, startDate, endDate, storeIds } = validated.data

  const existing = await prisma.reward.findUnique({ where: { name } })
  if (existing) {
    return { error: "Duplicate voucher", fieldErrors: { name: ["A voucher with that name already exists."] } }
  }

  let imageUrl = DEFAULT_VOUCHER_IMAGE_URL
  if (image) {
    const uploadRes = await utapi.uploadFiles(image)
    if (uploadRes.error) {
      return { error: "Unable to upload image" }
    }
    imageUrl = uploadRes.data.ufsUrl
  }

  await prisma.reward.create({
    data: {
      name,
      pointsRequired,
      description,
      isAvailable,
      image: imageUrl,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      allowedStores: { connect: storeIds.map((id) => ({ id })) },
    },
  })

  revalidatePath("/admin/voucher")
  return { success: "Voucher created successfully" }
}

// Update Voucher
const updateVoucher = async (id: string, values: z.infer<typeof UpdateVoucherSchema>) => {
  if (!(await requireAdmin())) {
    return { error: "Unauthorized access!" }
  }

  const validated = UpdateVoucherSchema.safeParse(values)
  if (!validated.success) {
    return { error: "Invalid fields", fieldErrors: validated.error.flatten().fieldErrors }
  }

  const { name, pointsRequired, description, isAvailable, image, startDate, endDate, storeIds } = validated.data

  const currentVoucher = await prisma.reward.findUnique({ where: { id } })
  if (!currentVoucher) {
    return { error: "Voucher not found" }
  }

  const duplicate = await prisma.reward.findFirst({ where: { name, NOT: { id } } })
  if (duplicate) {
    return { error: "Duplicate voucher", fieldErrors: { name: ["Another voucher with that name already exists."] } }
  }

  let imageUrl = currentVoucher.image
  if (image) {
    // The current image is only an UploadThing file to delete if it isn't
    // still the placeholder set by createVoucher for image-less vouchers.
    if (currentVoucher.image !== DEFAULT_VOUCHER_IMAGE_URL) {
      const deleteRes = await utapi.deleteFiles(currentVoucher.image.split("/").pop() as string)
      if (!deleteRes.success) {
        return { error: "Unable to delete existing image" }
      }
    }
    const uploadRes = await utapi.uploadFiles(image)
    if (uploadRes.error) {
      return { error: "Unable to upload image" }
    }
    imageUrl = uploadRes.data.ufsUrl
  }

  await prisma.reward.update({
    where: { id },
    data: {
      name,
      pointsRequired,
      description,
      isAvailable,
      image: imageUrl,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      allowedStores: { set: storeIds.map((storeId) => ({ id: storeId })) },
    },
  })

  revalidatePath("/admin/voucher")
  return { success: "Voucher updated successfully" }
}

// Toggle Availability
const toggleVoucherAvailability = async (id: string, isAvailable: boolean) => {
  if (!(await requireAdmin())) {
    return { error: "Unauthorized access!" }
  }

  await prisma.reward.update({ where: { id }, data: { isAvailable } })
  revalidatePath("/admin/voucher")
  return { success: "Voucher updated successfully" }
}

// Delete Voucher
const deleteVoucher = async (id: string) => {
  if (!(await requireAdmin())) {
    return { error: "Unauthorized access!" }
  }

  const voucher = await prisma.reward.findUnique({ where: { id } })
  if (!voucher) {
    return { error: "Voucher not found" }
  }

  try {
    // Nothing to delete from UploadThing if this voucher never got a real
    // uploaded image (still on the placeholder set by createVoucher).
    if (voucher.image !== DEFAULT_VOUCHER_IMAGE_URL) {
      const deleteRes = await utapi.deleteFiles(voucher.image.split("/").pop() as string)
      if (!deleteRes.success) {
        return { error: "Unable to delete image" }
      }
    }

    await prisma.reward.delete({ where: { id } })
    revalidatePath("/admin/voucher")
    return { success: "Voucher deleted successfully" }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to delete voucher" }
  }
}

// Get All Vouchers
const getVouchers = async (page: number, limit: number, sort: string, search: string) => {
  const session = await auth.api.getSession({ headers: await headers() })
  const user = session?.user
  if (user?.role !== "admin") {
    return { vouchers: [], voucherCount: 0, totalPages: 1 }
  }

  const whereClause = {
    name: search ? { contains: search, mode: "insensitive" as const } : undefined,
  }

  const orderBy = (function () {
    switch (sort) {
      case "nameAsc":
        return { name: "asc" as const }
      case "nameDesc":
        return { name: "desc" as const }
      case "pointsAsc":
        return { pointsRequired: "asc" as const }
      case "pointsDesc":
        return { pointsRequired: "desc" as const }
      case "dateAsc":
        return { createdAt: "asc" as const }
      case "dateDesc":
      default:
        return { createdAt: "desc" as const }
    }
  })()

  const [voucherCount, vouchers] = await Promise.all([
    prisma.reward.count({ where: whereClause }),
    prisma.reward.findMany({
      where: whereClause,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        pointsRequired: true,
        image: true,
        isAvailable: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        _count: { select: { redemptions: true, allowedStores: true } },
      },
    }),
  ])

  return { vouchers, voucherCount, totalPages: Math.max(1, Math.ceil(voucherCount / limit)) }
}

// Get Voucher by ID
const getVoucherById = async (id: string) => {
  return await prisma.reward.findUnique({
    where: { id },
    include: { allowedStores: { select: { id: true } } },
  })
}

export {
  createVoucher,
  updateVoucher,
  toggleVoucherAvailability,
  deleteVoucher,
  getVouchers,
  getVoucherById,
}
