"use server";

import prisma from "@/lib/db";
import { BinSchema } from "@/schemas";
import { Bin, BinMaterial, BinStatus, Prisma } from "@prisma/client";
import { compare } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const getAllBins = async () => {
  return await prisma.bin.findMany();
};

export const getBinById = async (id: string) => {
  return await prisma.bin.findUnique({
    where: {
      id: id,
    },
  });
};

export const getBinsByUserId = async (id: string) => {
  return await prisma.bin.findMany({
    where: {
      userId: id,
    },
  });
};

export const emptyBinsByUserId = async (
  userId: string,
  secondaryPassword: string
) => {
  const binUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!binUser) return { error: "User not found!" };
  const isMatched = await compare(
    secondaryPassword,
    binUser.secondaryPassword!
  );
  if (!isMatched) {
    return { error: "Invalid password!" };
  }
  await prisma.bin.updateMany({
    where: { userId: userId },
    data: { currentCapacity: 0 },
  });
  revalidatePath("/bin-capacity");
  return { success: "All bins emptied successfully!" };
};

export const createBin = async (values: z.infer<typeof BinSchema>) => {
  const validatedFields = BinSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const formData = validatedFields.data;
  const checkBinWithSimilarRecord = await checkExistingBinRecord(formData);

  if (checkBinWithSimilarRecord) {
    return {
      error: "Duplicate found. A bin of similar properties already exists",
    };
  }
  try {
    await prisma.bin.create({
      data: {
        location: formData.location as string,
        status: formData.status as BinStatus,
        material: formData.material as BinMaterial,
        User: {
          connect: { id: formData.userId },
        },
      },
    });
    return {
      success: "Bin created successfully",
    };
  } catch (error) {
    return {
      error: "Unexpected Error occurred, Failed to create bin",
    };
  }
};

export const updateBin = async (
  id: string,
  values: z.infer<typeof BinSchema>
) => {
  const validatedFields = BinSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const formData = validatedFields.data;
  const checkBin = await prisma.bin.findUnique({
    where: { id },
  });
  if (!checkBin) {
    return { error: "Bin does not exist" };
  }
  const checkBinWithSimilarRecord = await checkExistingBinRecord(formData);
  if (checkBinWithSimilarRecord) {
    return {
      error: "Duplicate found. A bin of similar properties already exists",
    };
  } else {
    try {
      await prisma.bin.update({
        where: { id },
        data: {
          location: formData.location,
          status: formData.status as BinStatus,
          material: formData.material as BinMaterial,
        },
      });
      return {
        success: `Bin updated successfully, Bin ID: ${id}`,
      };
    } catch (error) {
      return {
        error: "Unexpected error occurred, Failed to update bin",
      };
    }
  }
};

export const deleteBin = async (id: string) => {
  const bin = await prisma.bin.findUnique({
    where: {
      id,
    },
  });
  if (!bin) {
    await prisma.bin.delete({
      where: {
        id,
      },
    });
    return { success: `Bin with ID ${id} deleted successfully` };
  } else return { error: `Bin with ID ${id} does not exist` };
};

const checkExistingBinRecord = async (binData: {
  location: string;
  status: BinStatus;
  material: BinMaterial;
}) => {
  const bin = await prisma.bin.findUnique({
    where: {
      location_status_material: {
        location: binData.location,
        status: binData.status,
        material: binData.material,
      },
    },
  });
  if (bin !== null) return true;
  else false;
};

export const getChartData = async () => {
  const yearlyData: {
    month: string;
    bin: number;
    binMetal: number;
    binPlastic: number;
  }[] = [];
  const months: string[] = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  for (let i = 1; i <= 12; i++) {
    const startDate = new Date(`2024-${String(i).padStart(2, "0")}-01`); // Start of the month

    const endDate = new Date(`2024-${String(i).padStart(2, "0")}-01`);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0); // Set to the last day of the previous month

    // Fetch data for the current month
    const getMonthlyBinData = await prisma.bin.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const getMonthlyMetalBin = await prisma.bin.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        material: "METAL",
      },
    });

    const getMonthlyPlasticBin = await prisma.bin.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        material: "PLASTIC",
      },
    });

    yearlyData.push({
      month: months[i],
      bin: getMonthlyBinData.length,
      binMetal: getMonthlyMetalBin.length,
      binPlastic: getMonthlyPlasticBin.length,
    });
  }

  return yearlyData;
};

export const getBinCountsByMaterial = async () => {
  const pieChartData: {
    binType: BinMaterial;
    binCount: number;
    fill: string;
  }[] = [];
  const metalBinCount = await prisma.bin.count({
    where: {
      material: "METAL",
    },
  });
  const plasticBinCount = await prisma.bin.count({
    where: {
      material: "PLASTIC",
    },
  });
  pieChartData.push({
    binType: "METAL",
    binCount: metalBinCount,
    fill: "#2D88FF",
  });
  pieChartData.push({
    binType: "PLASTIC",
    binCount: plasticBinCount,
    fill: "#41B3A2",
  });
  return pieChartData;
};

// export const getBinCountsByStatus = async () => {
//   let pieChartData: {
//     binStatus: BinStatus;
//     binCount: number;
//     fill: String;
//   }[] = [];
//   const activeBinCount = await prisma.bin.count({
//     where: {
//       status: BinStatus.FUNCTIONAL,
//     },
//   });
//   const inactiveBinCount = await prisma.bin.count({
//     where: {
//       status: BinStatus.UNDER_MAINTENANCE,
//     },
//   });
//     pieChartData.push({
//       binStatus: BinStatus.FUNCTIONAL,
//       binCount: activeBinCount,
//       fill: "#2D88FF",
//     });
//   pieChartData.push({
//     binStatus: BinStatus.UNDER_MAINTENANCE,
//     binCount: inactiveBinCount,
//     fill: "#41B3A2",
//   });
//   return pieChartData;
// };

export const getBinCountsByStatus = async () => {
  const bins = await prisma.bin.findMany({
    where: {
      status: BinStatus.FUNCTIONAL,
    },
  });
  return bins.length;
};

export const getDisposals = async () => {
  const disposals = await prisma.disposal.findMany();
  return disposals.length;
};
