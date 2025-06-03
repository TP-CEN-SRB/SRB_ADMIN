"use server";

import prisma from "@/lib/db";
import { Faculty, Role, TransactionType } from "@prisma/client";
import { hash } from "bcryptjs";
import { getSessionUser } from "@/utils/getAuth";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";
import { revalidatePath } from "next/cache";
import { StoreSchema, UpdateStoreSchema } from "@/schemas";
import { z } from "zod";

const createStore = async (values: z.infer<typeof StoreSchema>) => {
  const validated = StoreSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields!" };

  const { name, email, password, faculty } = validated.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: "A user with this email already exists." };
  }

  const hashedPassword = await hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: capitalizeFirstLetter(name),
      email,
      password: hashedPassword,
      faculty: faculty as Faculty,
      role: Role.STORE,
      emailVerified: new Date(),
      point: { create: {} },
    },
  });

  revalidatePath("/admin/store");
  return { success: "Store created successfully", user };
};

const updateStore = async (
  id: string,
  values: z.infer<typeof UpdateStoreSchema>
) => {
  const validated = UpdateStoreSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields!" };

  const { name, email, password, faculty } = validated.data;

  const user = await prisma.user.findUnique({ where: { id, role: Role.STORE } });
  if (!user) return { error: "Store user not found" };

  const updatedData: {
    name: string;
    email: string;
    faculty: Faculty;
    password?: string;
  } = {
    name: capitalizeFirstLetter(name),
    email,
    faculty: faculty as Faculty,
  };

  if (password && password.trim() !== "") {
    updatedData.password = await hash(password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updatedData,
  });

  revalidatePath("/admin/store");
  return { success: `Store ${updatedUser.id} updated successfully` };
};

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
          updatedAt: true, // last active
        },
      },
      _count: {
        select: {
          transactions: {
            where: {
              transactionType: "PURCHASE",
            },
          },
        },
      },
      createdAt: true,
    },
  });
};

export const getStoreById = async (id: string) => {
  return await prisma.user.findUnique({
    where: {
      id,
      role: "STORE",
    },
    select: {
      id: true,
      name: true,
      email: true,
      faculty: true,
    },
  });
};

export const deleteStore = async (storeId: string) => {
  const user = await getSessionUser();

  if (user?.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.questDetails.delete({
      where: { id: storeId },
    });

    return { success: "Store deleted successfully" };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Failed to delete store" };
  }
};

export { createStore, updateStore, getStoreAccounts };