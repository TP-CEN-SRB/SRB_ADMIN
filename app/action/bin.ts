"use server";

import prisma from "@/lib/db";
import { BinMaterialSchema, BinSchema, UpdateBinSchema } from "@/schemas";
import { BinStatus } from "@prisma/client";
import { compare } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// export const getAllBins = async (startDate?: Date, endDate?: Date) => {
//   if (startDate !== undefined && endDate !== undefined) {
//     const adjustedEndDate = new Date(endDate);
//     adjustedEndDate.setHours(23, 59, 59, 999);
//     return await prisma.bin.findMany({
//       where: {
//         createdAt: {
//           gte: startDate,
//           lte: adjustedEndDate.toISOString(),
//         },
//       },
//     });
//   }
//   return await prisma.bin.findMany({
//     orderBy: {
//       createdAt: "desc",
//     },
//   });
// };
export const getAllBins = async () => {
  return await prisma.bin.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getBinById = async (id: string) => {
  return await prisma.bin.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          location: true,
        },
      },
      binMaterial: {
        select: {
          name: true,
        },
      },
    },
  });
};

export const getBinsByUserId = async (id: string) => {
  return await prisma.bin.findMany({
    where: {
      userId: id,
    },
    select: {
      status: true,
      currentCapacity: true,
      binMaterial: {
        select: {
          name: true,
        },
      },
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

export const createBin = async (
  values: z.infer<typeof BinSchema>,
  binUserId: string
) => {
  const validatedFields = BinSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const formData = validatedFields.data;
  for (let i = 0; i < formData.materialIds.length; i++) {
    const checkBinWithSimilarRecord = await checkExistingBinRecord(
      formData.location,
      formData.status,
      formData.materialIds[i],
      binUserId
    );
    if (checkBinWithSimilarRecord) {
      return {
        error: "Duplicate found. A bin of similar properties already exists",
      };
    }
    try {
      await prisma.bin.create({
        data: {
          status: formData.status as BinStatus,
          binMaterialId: formData.materialIds[i] as string,
          userId: binUserId,
        },
      });
      if (i == formData.materialIds.length - 1) {
        try {
          await prisma.user.update({
            where: { id: binUserId },
            data: { location: formData.location },
          });
        } catch (error) {
          return { error: "Failed to update user location" };
        }
        return {
          success: `Bin created successfully, Location: ${formData.location}`,
        };
      }
    } catch (error) {
      return {
        error: "Unexpected Error occurred, Failed to create bin",
      };
    }
  }
};

export const updateBin = async (
  id: string,
  values: z.infer<typeof UpdateBinSchema>
) => {
  console.log("Updating bin with ID:", id);
  const validatedFields = UpdateBinSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const formData = validatedFields.data;
  const checkIfBinExist = await prisma.bin.findUnique({
    where: { id },
  });
  if (!checkIfBinExist) {
    return { error: "Bin does not exist" };
  }
  const checkBinWithSimilarRecord = await checkExistingBinRecord(
    formData.location,
    formData.status,
    formData.materialId
  );
  if (checkBinWithSimilarRecord) {
    return {
      error: "Duplicate found. A bin of similar properties already exists",
    };
  } else {
    try {
      const [updateBin, updateLocation] = await Promise.all([
        prisma.bin.update({
          where: { id },
          data: {
            status: formData.status as BinStatus,
            binMaterialId: formData.materialId as string,
          },
        }),
        prisma.user.update({
          where: { id: checkIfBinExist.userId },
          data: {
            location: formData.location,
          },
        }),
      ]);
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
  if (bin) {
    await prisma.bin.delete({
      where: {
        id,
      },
    });
    return { success: `Bin with ID ${id} deleted successfully` };
  } else return { error: `Bin with ID ${id} does not exist` };
};

const checkExistingBinRecord = async (
  binLocation: string,
  binStatus: "FUNCTIONAL" | "UNDER_MAINTENANCE",
  binMaterialId: string,
  userId?: string
) => {
  const bin = await prisma.bin.findFirst({
    where: {
      binMaterialId,
      user: {
        location: binLocation,
        id: userId || undefined, // Ensure optional filtering on userId
      },
      status: binStatus,
    },
    include: {
      user: {
        select: {
          location: true, // Include location if you want to retrieve it
        },
      },
    },
  });

  return bin !== null;
};

export const getChartData = async () => {
  const months = [
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

  const yearlyData = await Promise.all(
    months.map(async (month, index) => {
      const startDate = new Date(2024, index, 1);
      const endDate = new Date(2024, index + 1, 0); // Last day of the month

      const monthlyBins = await prisma.bin.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          binMaterial: {
            select: {
              name: true,
            },
          },
        },
      });

      const binsByMaterial = monthlyBins.reduce(
        (acc, bin) => {
          const materialName = bin.binMaterial.name;
          if (materialName === "METAL") acc.metal++;
          if (materialName === "PLASTIC") acc.plastic++;
          return acc;
        },
        { metal: 0, plastic: 0 }
      );

      return {
        month,
        bin: monthlyBins.length,
        binMetal: binsByMaterial.metal,
        binPlastic: binsByMaterial.plastic,
      };
    })
  );

  return yearlyData;
};

interface BinCount {
  binType: string;
  binCount: number;
  fill: string;
}

const MATERIAL_COLORS = {
  METAL: "#2D88FF",
  PLASTIC: "#41B3A2",
} as const;

type MaterialType = keyof typeof MATERIAL_COLORS;

export const getBinCountsByMaterial = async (): Promise<BinCount[]> => {
  try {
    const binsCountWithMaterial = await prisma.bin.findMany({
      select: {
        binMaterial: {
          select: {
            name: true,
          },
        },
      },
    });

    const materialCounts = binsCountWithMaterial.reduce((acc, bin) => {
      const materialName = bin.binMaterial.name as MaterialType;
      if (materialName in MATERIAL_COLORS) {
        acc[materialName] = (acc[materialName] || 0) + 1;
      }
      return acc;
    }, {} as Record<MaterialType, number>);

    return Object.entries(materialCounts).map(([binType, count]) => ({
      binType,
      binCount: count,
      fill: MATERIAL_COLORS[binType as MaterialType],
    }));
  } catch (error) {
    console.error("Failed to fetch bin counts:", error);
    throw new Error("Failed to fetch bin counts by material");
  }
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

export const getBinDisposalsByTime = async () => {
  const hourlyDisposalData: {
    hour: string;
    totalDisposals: number;
    metalDisposals: number;
    plasticDisposals: number;
  }[] = [];
  const metalDisposals = [];
  const plasticDisposals = [];
  const hours: string[] = [
    "0600",
    "0700",
    "0800",
    "0900",
    "1000",
    "1100",
    "1200",
    "1300",
    "1400",
    "1500",
    "1600",
    "1700",
    "1800",
    "1900",
    "2000",
    "2100",
    "2200",
    "2300",
    "0000",
  ];

  const totalDisposals = await prisma.disposal.findMany({
    include: {
      bin: {
        select: {
          binMaterial: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
  const formatHour = (hour: string): string => {
    return `${hour.slice(0, 2)}`;
  };
  for (let i = 0; i < totalDisposals.length; i++) {
    if (totalDisposals[i].bin.binMaterial.name == "METAL") {
      metalDisposals.push(totalDisposals[i]);
    } else if (totalDisposals[i].bin.binMaterial.name == "PLASTIC") {
      plasticDisposals.push(totalDisposals[i]);
    }
  }

  for (let i = 0; i < hours.length - 1; i++) {
    const startHour = parseInt(formatHour(hours[i]));
    const endHour = parseInt(formatHour(hours[i + 1]));
    const hourlyMetalDisposals = metalDisposals.filter((disposal) => {
      const disposalTime = disposal.createdAt.getHours();
      return disposalTime >= startHour && disposalTime < endHour;
    }).length;

    const hourlyPlasticDisposals = plasticDisposals.filter((disposal) => {
      const disposalTime = disposal.createdAt.getHours();
      return disposalTime >= startHour && disposalTime < endHour;
    }).length;

    hourlyDisposalData.push({
      hour: hours[i],
      totalDisposals: hourlyMetalDisposals + hourlyPlasticDisposals,
      metalDisposals: hourlyMetalDisposals,
      plasticDisposals: hourlyPlasticDisposals,
    });
  }
  return hourlyDisposalData;
};

export const getAllBinsWithUser = async (userId?: string) => {
  if (userId) {
    return await prisma.bin.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            name: true,
            location: true,
          },
        },
        binMaterial: {
          select: {
            name: true,
          },
        },
      },
    });
  }
  return await prisma.bin.findMany({
    include: {
      user: {
        select: {
          name: true,
          location: true,
        },
      },
      binMaterial: {
        select: {
          name: true,
        },
      },
    },
  });
};

export const getUsedMaterialsForBin = async (userId: string) => {
  const usedBinMaterials = await prisma.bin.findMany({
    where: {
      userId,
    },
    select: {
      binMaterial: {
        select: {
          name: true,
        },
      },
    },
  });
  return usedBinMaterials;
};
