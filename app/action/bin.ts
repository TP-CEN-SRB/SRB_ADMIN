"use server";

import prisma from "@/lib/db";
import { BinMaterialSchema, BinSchema, UpdateBinSchema } from "@/schemas";
import { Bin, BinMaterial, BinStatus } from "@prisma/client";
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
export const getAllBins = async (dateFrom?: Date, dateTo?: Date) => {
  if (dateFrom !== undefined && dateTo !== undefined) {
    const adjustedEndDate = new Date(dateTo);
    adjustedEndDate.setHours(23, 59, 59, 999);
    return await prisma.bin.findMany({
      where: {
        createdAt: {
          gte: dateFrom,
          lte: adjustedEndDate,
        },
      },
    });
  }
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

export const getBinByUserIdAndMaterial = async (
  id: string,
  material: string
) => {
  const bin = await prisma.bin.findFirst({
    where: {
      binMaterial: {
        name: material.toUpperCase(),
      },
      userId: id,
    },
    include: {
      binMaterial: {
        select: {
          name: true,
        },
      },
    },
  });
  return bin;
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
      revalidatePath("/admin/bin");
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

//barchart data
export const getPieChartData = async () => {
  //create an array of months
  const months = Array.from({ length: 12 }, (item, i) => {
    return new Date(0, i).toLocaleString("en-US", { month: "long" });
  });
  //fetch all unique material names from the database
  const materialNames = await prisma.binMaterial.findMany({
    select: {
      name: true,
    },
  });
  //get data for each month
  const yearlyData = await Promise.all(
    months.map(async (month, index) => {
      const startDate = new Date(2024, index, 1);
      const endDate = new Date(2024, index + 1, 0); // Last day of the month
      // fetch bins for the specific month
      const monthlyBins = await prisma.bin.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          binMaterial: {
            select: {
              name: true,
            },
          },
        },
      });
      const materialCounts = materialNames.reduce((acc, material) => {
        acc[material.name] = 0; // Initialize each material's count to 0
        return acc;
      }, {} as Record<string, number>);
      //acc is an object that stores the count of each material,
      //reduce is used to iterate over the bins and increment the count of each material, updating the acc
      const binsByMaterial = monthlyBins.reduce(
        (acc, bin) => {
          const material = bin.binMaterial.name; // Get the material name
          if (acc[material] !== undefined) {
            acc[material]++;
          }
          return acc;
        },
        { ...materialCounts }
      );
      // Use the dynamic materialCounts as the initial value // Initialize counts for all materials { METAL: 0, PLASTIC: 0 }
      // return monthly data including bin counts for each material
      const returnObj = {
        month,
        bin: monthlyBins.length,
        ...binsByMaterial,
      };

      return returnObj;
    })
  );

  return yearlyData;
};

interface BinCount {
  binType: string;
  binCount: number;
  fill: string;
}

export const getBinCountsByMaterial = async (): Promise<BinCount[]> => {
  // First, get all materials from the BinMaterial table
  const allMaterials = await prisma.binMaterial.findMany({
    select: {
      name: true,
    },
  });

  // Then get the bin counts
  const binsCountWithMaterial = await prisma.bin.findMany({
    select: {
      binMaterial: {
        select: {
          name: true,
        },
      },
    },
  });

  // Count the materials
  const materialCounts = binsCountWithMaterial.reduce((acc, bin) => {
    const materialName = bin.binMaterial.name;
    acc[materialName] = (acc[materialName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Map all materials, including those with zero counts
  return allMaterials.map((material, index) => ({
    binType: material.name,
    binCount: materialCounts[material.name] || 0,
    fill: `hsl(${170 + index * 15}, 70%, 50%)`,
  }));
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

export const getBinCountsByStatus = async (
  dateFrom?: Date,
  dateTo?: Date,
  notFunctional?: boolean
) => {
  let bins: Bin[] = [];
  if (dateFrom !== undefined && dateTo !== undefined) {
    const adjustedEndDate = new Date(dateTo);
    adjustedEndDate.setHours(23, 59, 59, 999);

    if (notFunctional) {
      bins = await prisma.bin.findMany({
        where: {
          createdAt: {
            gte: dateFrom,
            lte: adjustedEndDate,
          },
          status: BinStatus.UNDER_MAINTENANCE,
        },
      });
    } else {
      bins = await prisma.bin.findMany({
        where: {
          createdAt: {
            gte: dateFrom,
            lte: adjustedEndDate,
          },
          status: BinStatus.FUNCTIONAL,
        },
      });
    }
  } else {
    if (notFunctional) {
      bins = await prisma.bin.findMany({
        where: {
          status: BinStatus.UNDER_MAINTENANCE,
        },
      });
    } else {
      bins = await prisma.bin.findMany({
        where: {
          status: BinStatus.FUNCTIONAL,
        },
      });
    }
  }
  return bins.length;
};

export const getDisposals = async (dateFrom?: Date, dateTo?: Date) => {
  if (dateFrom !== undefined && dateTo !== undefined) {
    const adjustedEndDate = new Date(dateTo);
    adjustedEndDate.setHours(23, 59, 59, 999);
    const disposals = await prisma.disposal.findMany({
      where: {
        createdAt: {
          gte: dateFrom,
          lte: adjustedEndDate,
        },
      },
      select: {
        id: true,
      },
    });
    return disposals.length;
  }
  const disposals = await prisma.disposal.findMany();
  return disposals.length;
};

// Define the type for our result objects
type DisposalsByHour = {
  hour: string;
  [key: string]: string | number; // Index signature to allow dynamic material properties
};

export const getBinDisposalsByTime = async (): Promise<DisposalsByHour[]> => {
  // Get all bin materials from the database
  const binMaterials = await prisma.binMaterial.findMany({
    select: {
      name: true,
    },
  });

  // Get all disposals with their bin material information
  const totalDisposals = await prisma.disposal.findMany({
    include: {
      bin: {
        select: {
          binMaterial: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Generate array of hours from 06:00 to 23:00
  const hours = Array.from({ length: 18 }, (_, i) => {
    const hour = i + 6;
    return hour.toString().padStart(2, "0") + "00";
  });

  // Initialize result array with hour objects
  const result: DisposalsByHour[] = hours.map((hour) => ({
    hour,
    ...Object.fromEntries(binMaterials.map((material) => [material.name, 0])),
  }));

  // Count disposals for each hour and material
  totalDisposals.forEach((disposal) => {
    const hour = disposal.createdAt.getHours();
    if (hour >= 6 && hour <= 23) {
      const hourIndex = hour - 6;
      const materialName = disposal.bin.binMaterial.name;
      if (result[hourIndex]) {
        result[hourIndex][materialName] =
          (result[hourIndex][materialName] as number) + 1;
      }
    }
  });

  return result;
};

export const getAllBinsWithUserAndMaterial = async (userId?: string) => {
  const bins = await prisma.bin.findMany({
    where: userId ? { userId } : undefined,
    select: {
      id: true,
      status: true,
      currentCapacity: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { disposals: true } },
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
  const materials = await prisma.binMaterial.findMany();
  return { bins, materials };
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

// export const getAllBinsAsync = async (
//   page: number,
//   query: string | null,
//   sortStatus: string,
//   sortMaterial: string
// ) => {
//   const pageCondition = page < 0;
//   const sortableEntities = ["status", "material"];
//   const allowedStatusTypes = ["FUNCTIONAL", "UNDER_MAINTENANCE"];
//   const sortStatusCondition =
//     sortStatus !== undefined &&
//     !sortStatus
//       .split(",")
//       .every((status) => allowedStatusTypes.includes(status));
//   if (sortStatusCondition) {
//     return { binCount: 0, bins: [] };
//   }
//   const bins = await prisma.bin.findMany({
//     where: {
//       status: query as BinStatus,
//     },
//   });
//   return { binCount: bins.length, bins };
// };
