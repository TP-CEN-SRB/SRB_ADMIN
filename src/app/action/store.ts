"use server"

import { prisma } from "@/lib/db"
import { Faculty, Role } from "@/generated/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { StoreSchema, UpdateStoreSchema } from "@/schemas"
import { z } from "zod"
import { createCredentialUser, updateCredentialPassword } from "@/lib/createCredentialUser"

function capitalizeFirstLetter(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
// Create Store
const createStore = async (values: z.infer<typeof StoreSchema>) => {
  const validated = StoreSchema.safeParse(values)
  if (!validated.success) {
    return {
      error: "Invalid fields",
      fieldErrors: validated.error.flatten().fieldErrors,
    }
  }

  const { name, email, password, faculty, location, lat, long } = validated.data

  try {
    const user = await createCredentialUser({
      name: capitalizeFirstLetter(name),
      email,
      password,
      role: Role.STORE,
      faculty: faculty as Faculty,
      location,
      lat,
      long,
    })

    revalidatePath("/admin/store")
    revalidatePath("/admin/store/map")
    return { success: "Store created successfully", user }
  } catch (error) {
    console.error("[createStore] error:", error)
    // location is unique - surface a friendlier message than the raw Prisma
    // P2002 constraint error when two stores are dropped on the same spot.
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return {
        error: "Another store is already using that location.",
        fieldErrors: { location: ["Another store is already using that location."] },
      }
    }
    return { error: error instanceof Error ? error.message : "Failed to create store" }
  }
}

// Update Store
const updateStore = async (id: string, values: z.infer<typeof UpdateStoreSchema>) => {
  const validated = UpdateStoreSchema.safeParse(values)
  if (!validated.success) {
    return {
      error: "Invalid fields",
      fieldErrors: validated.error.flatten().fieldErrors,
    }
  }

  const { name, email, password, faculty, location, lat, long } = validated.data

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { name: name.toLowerCase() },
        { email: email.toLowerCase() },
        { location },
      ],
      NOT: { id },
    },
  })

  if (existing) {
    const fieldErrors: Record<string, string[]> = {}
    if (existing.name === name.toLowerCase()) {
      fieldErrors.name = ["Another store with that name already exists."]
    }
    if (existing.email === email.toLowerCase()) {
      fieldErrors.email = ["Another store with that email already exists."]
    }
    if (existing.location === location) {
      fieldErrors.location = ["Another store is already using that location."]
    }

    return {
      error: "Duplicate store",
      fieldErrors,
    }
  }

  const user = await prisma.user.findUnique({ where: { id, role: Role.STORE } })
  if (!user) return { error: "Store user not found" }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: capitalizeFirstLetter(name),
      email: email.toLowerCase(),
      faculty: faculty as Faculty,
      location,
      lat,
      long,
    },
  })

  // Credential passwords live on the Account row, not User - see
  // lib/createCredentialUser.ts.
  if (password && password.trim() !== "") {
    await updateCredentialPassword(id, password)
  }

  revalidatePath("/admin/store")
  revalidatePath("/admin/store/map")
  revalidatePath("/admin/store/update/[storeId]", "page")
  return { success: `Store ${updatedUser.id} updated successfully` }
}

// Get All Stores
const getStoreAccounts = async (
  page: number,
  limit: number,
  sort: string,
  search: string,
  faculties: string[]
) => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (user?.role !== Role.admin) {
    return { stores: [], storeCount: 0, totalPages: 1 }
  }

  const whereClause = {
    role: Role.STORE,
    faculty: { in: faculties as Faculty[] },
    OR: search
      ? [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ]
      : undefined,
  }

  const orderBy = (function(){
    switch (sort) {
      case "nameAsc":
        return { name: "asc" as const }
      case "nameDesc":
        return { name: "desc" as const }
      case "dateAsc":
        return { createdAt: "asc" as const }
      case "dateDesc":
      default:
        return { createdAt: "desc" as const }
    }
  })()

  const [storeCount, stores] = await Promise.all([
    prisma.user.count({ where: whereClause }),
    prisma.user.findMany({
      where: whereClause,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        faculty: true,
        location: true,
        point: {
          select: {
            balance: true,
            updatedAt: true,
          },
        },
        _count: {
          select: {
            transactions: {
              where: { transactionType: "PURCHASE" },
            },
          },
        },
        createdAt: true,
      },
    }),
  ])

  return { stores, storeCount, totalPages: Math.max(1, Math.ceil(storeCount / limit)) }
}

// Get Store by ID
const getStoreById = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id,
      role: Role.STORE,
    },
    select: {
      id: true,
      name: true,
      email: true,
      faculty: true,
      location: true,
      lat: true,
      long: true,
    },
  })
}

// Get All Stores - lightweight list for the store map (mirrors
// getAllBinManagers), used both to plot the read-only overview map and to
// show "other stores" while an admin drags a new/existing store's pin.
const getAllStores = async () => {
  return await prisma.user.findMany({
    where: { role: Role.STORE },
    select: {
      id: true,
      name: true,
      email: true,
      faculty: true,
      lat: true,
      long: true,
      _count: {
        select: { fulfilledRedemptions: true },
      },
    },
  })
}

// Get Store Options - lightweight list for pickers (e.g. voucher store restriction)
const getStoreOptions = async () => {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user
  if (user?.role !== Role.admin) {
    return []
  }

  return await prisma.user.findMany({
    where: { role: Role.STORE },
    orderBy: { name: "asc" },
    select: { id: true, name: true, faculty: true },
  })
}

// Delete Store
const deleteStore = async (storeId: string) => {
    const session = await auth.api.getSession({
    headers: await headers()
  })
  const user = session?.user

  if (user?.role !== Role.admin) {
    return { error: "Unauthorized" }
  }

  try {
    await prisma.user.delete({
      where: { id: storeId, role: Role.STORE },
    })

    revalidatePath("/admin/store")
    return { success: "Store deleted successfully" }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message }
    }
    return { error: "Failed to delete store" }
  }
}

export {
  createStore,
  updateStore,
  getStoreAccounts,
  getStoreById,
  getStoreOptions,
  getAllStores,
  deleteStore,
}
