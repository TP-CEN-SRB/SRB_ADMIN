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

const getDisposalByBinId = async (
  binId: string,
  page: number | null,
  sortOrder: string | undefined,
  sortItem: string | undefined
) => {
  const user = await getSessionUser();
  if (user?.role !== "ADMIN") {
    return { error: "Permission denied!" };
  }
  const sortableItems = ["weight", "point", "createdAt"];
  const pageCondition = page != null && page < 0;
  const sortOrderCondition =
    sortOrder !== undefined && sortOrder !== "asc" && sortOrder !== "desc";
  const sortItemCondition =
    sortItem !== undefined && !Object.values(sortableItems).includes(sortItem);
  if (pageCondition || sortItemCondition || sortOrderCondition) {
    return { disposalCount: 0, disposals: [] };
  }

  const [disposalCount, disposals, bin] = await Promise.all([
    prisma.disposal.count({ where: { binId: binId } }),
    prisma.disposal.findMany({
      where: { binId: binId },
      take: page ? 10 : undefined,
      skip: page ? (page - 1) * 10 : 0,
      orderBy:
        sortItem === sortableItems[0]
          ? { weightInGrams: sortOrder }
          : sortItem === sortableItems[1]
          ? { pointsAwarded: sortOrder }
          : sortItem === sortableItems[2]
          ? { createdAt: sortOrder }
          : { createdAt: "desc" },
      select: {
        id: true,
        weightInGrams: true,
        isRedeemed: true,
        pointsAwarded: true,
        userId: true,
        createdAt: true,
      },
    }),
    prisma.bin.findUnique({
      where: { id: binId },
      select: {
        binMaterial: { select: { name: true } },
        user: { select: { location: true } },
      },
    }),
  ]);
  return { disposalCount, disposals, bin };
};

export { createDisposal, getUnscannedDisposal, getDisposalByBinId };
