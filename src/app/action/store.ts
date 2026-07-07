"use server"

import { prisma } from "@/lib/db"
import { Faculty, Role } from "@/generated/prisma"
import { hash } from "bcryptjs"
import { getSessionUser } from "@/utils/getAuth"
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter"
import { revalidatePath } from "next/cache"
import { StoreSchema, UpdateStoreSchema } from "@/schemas"
import { z } from "zod"

// Create Store
const createStore = async (values: z.infer<typeof StoreSchema>) => {
  const validated = StoreSchema.safeParse(values)
  if (!validated.success) {
    return {
      error: "Invalid fields",
      fieldErrors: validated.error.flatten().fieldErrors,
    }
  }

  const { name, email, password, faculty } = validated.data

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { name: name.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    },
  })

  if (existing) {
    const fieldErrors: Record<string, string[]> = {}
    if (existing.name === name.toLowerCase()) {
      fieldErrors.name = ["A store with that name already exists."]
    }
    if (existing.email === email.toLowerCase()) {
      fieldErrors.email = ["A store with that email already exists."]
    }

    return {
      error: "Duplicate store",
      fieldErrors,
    }
  }

  const hashedPassword = await hash(password, 10)

  const user = await prisma.user.create({
    data: {
      name: capitalizeFirstLetter(name),
      email: email.toLowerCase(),
      password: hashedPassword,
      faculty: faculty as Faculty,
      diploma: "N/A",
      role: Role.STORE,
      emailVerified: true,
      point: { create: {} },
    },
  })

  revalidatePath("/admin/store")
  return { success: "Store created successfully", user }
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

  const { name, email, password, faculty } = validated.data

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { name: name.toLowerCase() },
        { email: email.toLowerCase() },
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

    return {
      error: "Duplicate store",
      fieldErrors,
    }
  }

  const user = await prisma.user.findUnique({ where: { id, role: Role.STORE } })
  if (!user) return { error: "Store user not found" }

  const updatedData: {
    name: string
    email: string
    faculty: Faculty
    password?: string
  } = {
    name: capitalizeFirstLetter(name),
    email: email.toLowerCase(),
    faculty: faculty as Faculty,
  }

  if (password && password.trim() !== "") {
    updatedData.password = await hash(password, 10)
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updatedData,
  })

  revalidatePath("/admin/store")
  return { success: `Store ${updatedUser.id} updated successfully` }
}

// Get All Stores
const getStoreAccounts = async () => {
  return await prisma.user.findMany({
    where: { role: Role.STORE },
    select: {
      id: true,
      name: true,
      email: true,
      faculty: true,
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
  })
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
    },
  })
}

// Delete Store
const deleteStore = async (storeId: string) => {
  const user = await getSessionUser()

  if (user?.role !== Role.ADMIN) {
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
  deleteStore,
}
