"use server";
import prisma from "@/lib/db";
import { DisposalSchema } from "@/schemas";
import { getSessionUser } from "@/utils/getAuth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createDisposal = async (
  values: z.infer<typeof DisposalSchema>,
  userId: string,
  binCapacity: number
) => {
  // Check if user has permission
  const user = await getSessionUser();
  if (user?.role !== "BIN") {
    return { error: "Permission denied!" };
  }
  const validatedFields = DisposalSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const { material, weightInGrams } = validatedFields.data;
  const bin = await prisma.bin.findFirst({
    where: {
      binMaterial: {
        name: material.toUpperCase(),
      },
      userId: userId,
    },
  });
  if (!bin) return { error: "No bin found" };
  const disposal = await prisma.disposal.create({
    data: {
      weightInGrams: weightInGrams,
      binId: bin.id,
      pointsAwarded: weightInGrams, // 1g = 1 point
    },
  });
  if (disposal) {
    await prisma.bin.update({
      where: {
        id: bin.id,
      },
      data: {
        currentCapacity: parseFloat(binCapacity.toFixed(2)),
      },
    });
  }
  revalidatePath("/bin-capacity");
  return { id: disposal.id };
};
const getUnscannedDisposal = async (id: string) => {
  // Check if user has permission
  const user = await getSessionUser();
  if (user?.role !== "BIN") {
    console.log("Permission denied!");
  }
  const disposal = await prisma.disposal.findFirst({
    where: {
      id: id,
      isRedeemed: false,
    },
    include: {
      bin: {
        include: {
          binMaterial: true,
        },
      },
    },
  });

  return disposal;
};

export { createDisposal, getUnscannedDisposal };
