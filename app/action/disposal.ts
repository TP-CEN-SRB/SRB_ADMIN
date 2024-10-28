"use server";
import prisma from "@/lib/db";
import { DisposalSchema } from "@/schemas";
import { BinMaterial } from "@prisma/client";
import { z } from "zod";

const createDisposal = async (values: z.infer<typeof DisposalSchema>) => {
  const validatedFields = DisposalSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const { material, weightInGrams } = validatedFields.data;
  const bin = await prisma.bin.findFirst({
    where: {
      material: material as BinMaterial,
    },
  });
  if (!bin) return { error: "No bin found" };
  const disposal = await prisma.disposal.create({
    data: {
      weightInGrams: weightInGrams,
      binId: bin.id,
      isScanned: false,
    },
  });
  return { id: disposal.id };
};
const getUnscannedDisposal = async (id: string) => {
  // if (!id) return { error: "Missing Id" };
  const disposal = await prisma.disposal.findFirst({
    where: {
      id: id,
      isScanned: false,
    },
  });

  return disposal;
};

export { createDisposal, getUnscannedDisposal };
