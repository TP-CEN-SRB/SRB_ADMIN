"use server";
import prisma from "@/lib/db";
import { DisposalSchema } from "@/schemas";
import { getSessionUser } from "@/utils/getAuth";
import { z } from "zod";

const createDisposal = async (
  values: z.infer<typeof DisposalSchema>,
  userId: string
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
    select: {
      id: true,
      status: true,
      currentCapacity: true,
      user: { select: { location: true, faculty: true } },
      binMaterial: { select: { name: true } },
    },
  });
  if (!bin) return { error: "No bin found" };
  if (bin.status === "UNDER_MAINTENANCE") {
    return { error: "Bin is currently under maintenance" };
  }
  if (bin.currentCapacity === 100) {
    return { error: "Bin is already full!" };
  }
  const disposal = await prisma.disposal.create({
    data: {
      weightInGrams: weightInGrams,
      binId: bin.id,
      pointsAwarded: weightInGrams, // 1g = 1 point
    },
  });
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
