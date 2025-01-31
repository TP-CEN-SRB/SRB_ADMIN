"use server";

import prisma from "@/lib/db";
import { BinMaterialSchema, BinSchema, UpdateBinSchema } from "@/schemas";
import { Bin, BinMaterial, BinStatus, Role } from "@prisma/client";
import { compare } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getWeeksInMonth, months, days } from "@/utils/dateUtils";

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
        revalidatePath("/admin/bin");
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
      await Promise.all([
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
    revalidatePath("/admin/bin");
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

type MaterialCounts = {
  [key: string]: number;
};

type MonthlyData = {
  month: string;
  bin: number;
  [key: string]: number | string;
};

function getWeekDatesByIndex(weekIndex: number) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

  // Adjust the start to the first Monday of the month or the first day of the month
  const firstMonday = new Date(firstDayOfMonth);
  while (firstMonday.getDay() !== 1) {
    firstMonday.setDate(firstMonday.getDate() - 1);
  }

  const startDates = Array.from(
    {
      length: Math.ceil(
        (lastDayOfMonth.getDate() + (firstDayOfMonth.getDay() || 7) - 1) / 7
      ),
    },
    (_, i) => {
      const start = new Date(firstMonday);
      start.setDate(start.getDate() + i * 7);
      start.setHours(0, 0, 0, 0); // Ensure the start of the week is at 00:00:00.000
      return start;
    }
  );

  const weekRanges = startDates.map((startOfWeek) => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999); // Set the end of the week to 23:59:59.999

    return {
      start: startOfWeek,
      end: endOfWeek > lastDayOfMonth ? new Date(lastDayOfMonth.setHours(23, 59, 59, 999)) : endOfWeek,
    };
  }).filter(week => 
    week.start.getMonth() === currentMonth || 
    week.end.getMonth() === currentMonth
  );

  if (weekIndex < 0 || weekIndex >= weekRanges.length) {
    throw new Error(
      "Invalid week index. Ensure it's within the range of weeks for the month."
    );
  }

  return weekRanges[weekIndex];
}


export const getBarChartData = async (
  dateFrom?: Date,
  dateTo?: Date,
  filter?: string
): Promise<MonthlyData[]> => {
  // const month = Array.from({ length: getWeeksInMonth(dateFrom, dateTo) }, (_, i) => `Wk ${i + 1}`);
  const weeks = getWeeksInMonth(dateFrom, dateTo);

  // Fetch all unique material names from the database
  const materialNames = await prisma.binMaterial.findMany({
    select: {
      name: true,
    },
  });

  const startOfPeriod = new Date(dateFrom || new Date());
  const endOfPeriod = new Date(dateTo || new Date());

  const barChartData = await Promise.all(
    filter == "week"
      ? days.map(async (day, dayIndex) => {
          startOfPeriod.setDate(
            startOfPeriod.getDate() - ((startOfPeriod.getDay() + 6) % 7) + 1
          );
          endOfPeriod.setDate(
            endOfPeriod.getDate() + ((7 - endOfPeriod.getDay()) % 7)
          );

          const weeklyBins = await prisma.bin.findMany({
            where: {
              createdAt:
                dateFrom || dateTo
                  ? {
                      gte: startOfPeriod,
                      lte: endOfPeriod,
                    }
                  : undefined,
            },
            select: {
              createdAt: true,
              binMaterial: {
                select: {
                  name: true,
                },
              },
            },
          });

          const filteredBins = weeklyBins.filter(
            (bin) => bin.createdAt.getDay() - 1 == dayIndex
          );

          const materialCounts = materialNames.reduce((acc, material) => {
            acc[material.name] = 0;
            return acc;
          }, {} as MaterialCounts);

          filteredBins.forEach((bin) => {
            const material = bin.binMaterial.name;
            if (material in materialCounts) {
              materialCounts[material]++;
            }
          });

          return {
            month: day,
            bin: filteredBins.length,
            ...materialCounts,
          };
        })
      : filter == "month"
      ? weeks.map(async (week, weekIndex) => {
          const { start, end } = getWeekDatesByIndex(weekIndex);

          const weeklyBins = await prisma.bin.findMany({
            where: {
              createdAt: {
                gte: start,
                lte: end,
              },
            },
            select: {
              createdAt: true,
              binMaterial: {
                select: {
                  name: true,
                },
              },
            },
          });

          const filteredBins = weeklyBins.filter(
            (bin) => bin.createdAt >= start && bin.createdAt <= end
          );

          const materialCounts = materialNames.reduce((acc, material) => {
            acc[material.name] = 0;
            return acc;
          }, {} as MaterialCounts);

          filteredBins.forEach((bin) => {
            const material = bin.binMaterial.name;
            if (material in materialCounts) {
              materialCounts[material]++;
            }
          });
          // console.log({month: week, bin: filteredBins.length, ...materialCounts});
          return {
            month: week,
            bin: filteredBins.length,
            ...materialCounts,
          };
        })
      : months.map(async (month, monthIndex) => {
          startOfPeriod.setMonth(monthIndex);
          startOfPeriod.setDate(1);
          startOfPeriod.setHours(0, 0, 0, 0);

          endOfPeriod.setMonth(monthIndex + 1);
          endOfPeriod.setDate(0);
          endOfPeriod.setHours(23, 59, 59, 999);

          const monthlyBins = await prisma.bin.findMany({
            where: {
              createdAt:
                dateFrom || dateTo
                  ? {
                      gte: dateFrom,
                      lte: endOfPeriod,
                    }
                  : undefined,
            },
            select: {
              createdAt: true,
              binMaterial: {
                select: {
                  name: true,
                },
              },
            },
          });

          const filteredBins = monthlyBins.filter(
            (bin) => bin.createdAt.getMonth() == monthIndex
          );

          // Initialize counts for all materials
          const materialCounts = materialNames.reduce((acc, material) => {
            acc[material.name] = 0;
            return acc;
          }, {} as MaterialCounts);

          // Count bins by material for this specific month
          filteredBins.forEach((bin) => {
            const material = bin.binMaterial.name;
            if (material in materialCounts) {
              materialCounts[material]++;
            }
          });

          return {
            month,
            bin: filteredBins.length,
            ...materialCounts,
          };
        })
  );
  return barChartData;
};

interface BinCount {
  binType: string;
  binCount: number;
  fill: string;
}

export const getBinCountsByMaterial = async (
  dateFrom?: Date,
  dateTo?: Date
): Promise<BinCount[]> => {
  // Get counts directly using groupBy and count
  const binCounts = await prisma.bin.groupBy({
    by: ["binMaterialId"],
    where: {
      createdAt: {
        gte: dateFrom || undefined,
        lte: dateTo || undefined,
      },
    },
    _count: {
      _all: true,
    },
  });

  // Get all materials to ensure we include those with zero counts
  const allMaterials = await prisma.binMaterial.findMany({
    select: {
      id: true,
      name: true,
    },
  });

  // Create a map of material counts
  const countMap = new Map(
    binCounts.map((count) => [count.binMaterialId, count._count._all])
  );

  // console.log(allMaterials.map((material, index) => ({
  //   binType: material.name,
  //   binCount: countMap.get(material.id) || 0,
  //   fill: `hsl(${170 + index * 15}, 70%, 50%)`
  // })));

  // Map the results, including zero counts for unused materials
  return allMaterials.map((material, index) => ({
    binType: material.name,
    binCount: countMap.get(material.id) || 0,
    fill: `hsl(${170 + index * 15}, 70%, 50%)`,
  }));
};

export const getPieChartData = async (
  dateFrom?: Date,
  dateTo?: Date,
  filter?: string
) => {
  const startOfPeriod = dateFrom ? new Date(dateFrom) : undefined;
  const endOfPeriod = dateTo ? new Date(dateTo) : undefined;

  switch (filter) {
    case "week": {
      if (startOfPeriod && endOfPeriod) {
        startOfPeriod.setDate(
          startOfPeriod.getDate() - ((startOfPeriod.getDay() + 6) % 7) + 1
        );
        endOfPeriod.setDate(
          endOfPeriod.getDate() + ((7 - endOfPeriod.getDay()) % 7)
        );
      }
      break;
    }
    case "month": {
      if (startOfPeriod && endOfPeriod) {
          startOfPeriod.setDate(1);
          startOfPeriod.setHours(0, 0, 0, 0);
          startOfPeriod.setMinutes(0);

          endOfPeriod.setFullYear(startOfPeriod.getFullYear());
          endOfPeriod.setMonth(startOfPeriod.getMonth());
          endOfPeriod.setDate(new Date(startOfPeriod.getFullYear(), startOfPeriod.getMonth() + 1, 0).getDate());
          endOfPeriod.setHours(23, 59, 59, 999);
      }
      break;
    }
    case "year": {
      if (startOfPeriod && endOfPeriod) {
        startOfPeriod.setMonth(0);
        startOfPeriod.setDate(1);
        startOfPeriod.setHours(0, 0, 0, 0);
        endOfPeriod.setMonth(11);
        endOfPeriod.setDate(31);
        endOfPeriod.setHours(23, 59, 59, 999);
      }
      break;
    }
    default: {
      // Handle default case if needed
    }
  }
  const binsWithFaculty = await prisma.bin.findMany({
    include: {
      user: {
        select: {
          faculty: true,
        },
      },
    },
    where: {
      user: {
        role: "BIN" as Role,
      },
      createdAt: {
        gte: startOfPeriod,
        lte: endOfPeriod,
      },
    },
  });

  const faculties = await prisma.user.groupBy({
    by: ["faculty"],
  });

  const binsByFaculty = faculties.reduce(
    (acc: Record<string, number>, faculty) => {
      acc[faculty.faculty] = 0;
      return acc;
    },
    {}
  );

  binsWithFaculty.forEach((bin) => {
    if (bin.user.faculty) {
      binsByFaculty[bin.user.faculty]++;
    }
  });

  // console.log(binsByFaculty);

  return Object.keys(binsByFaculty).map((faculty, index) => ({
    fac: faculty,
    count: binsByFaculty[faculty],
    fill: `hsl(${170 + index * 15}, 70%, 50%)`,
  }));
};

export const getBinCountsByStatus = async (
  dateFrom?: Date,
  dateTo?: Date,
  notFunctional?: boolean,
  filter?: string
) => {
  let bins: Bin[] = [];
  if (dateFrom !== undefined && dateTo !== undefined) {
    const adjustedEndDate = new Date(dateTo);
    adjustedEndDate.setHours(23, 59, 59, 999);

  const startOfPeriod = dateFrom ? new Date(dateFrom) : undefined;
  const endOfPeriod = dateTo ? new Date(dateTo) : undefined;

  switch (filter) {
    case 'week':{
      if (startOfPeriod && endOfPeriod) {
        startOfPeriod.setDate(startOfPeriod.getDate() - (startOfPeriod.getDay() + 6) % 7 + 1);
        endOfPeriod.setDate(endOfPeriod.getDate() + (7 - endOfPeriod.getDay()) % 7);
      }
      break;
    }
    case 'month':{
      if (startOfPeriod && endOfPeriod) {
        startOfPeriod.setDate(1);
        startOfPeriod.setHours(0, 0, 0, 0);
        startOfPeriod.setMinutes(0);

        endOfPeriod.setFullYear(startOfPeriod.getFullYear());
        endOfPeriod.setMonth(startOfPeriod.getMonth());
        endOfPeriod.setDate(new Date(startOfPeriod.getFullYear(), startOfPeriod.getMonth() + 1, 0).getDate());
        endOfPeriod.setHours(23, 59, 59, 999);
      }
      break;
    }
    case 'year':{
      if (startOfPeriod && endOfPeriod) {
        startOfPeriod.setMonth(0);
        startOfPeriod.setDate(1);
        startOfPeriod.setHours(0, 0, 0, 0);
        endOfPeriod.setMonth(11);
        endOfPeriod.setDate(31);
        endOfPeriod.setHours(23, 59, 59, 999);
      }
      break;
    }
    default: {
      // Handle default case if needed
    }
  }

    if (notFunctional) {
      bins = await prisma.bin.findMany({
        where: {
          createdAt: {
            gte: startOfPeriod,
            lte: endOfPeriod,
          },
          status: BinStatus.UNDER_MAINTENANCE,
        },
      });
    } else {
      bins = await prisma.bin.findMany({
        where: {
          createdAt: {
            gte: startOfPeriod,
            lte: endOfPeriod,
          },
          status: BinStatus.FUNCTIONAL,
        },
      });
    }
} 
else {
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
  // console.log(disposals.length);
  return disposals.length;
};

type DisposalsByHour = {
  hour: string;
  [key: string]: string | number;
};

export const getBinDisposalsByTime = async (
  dateFrom?: Date,
  dateTo?: Date,
  filter?: string
): Promise<DisposalsByHour[]> => {
  const startOfPeriod = dateFrom ? new Date(dateFrom) : undefined;
  const endOfPeriod = dateTo ? new Date(dateTo) : undefined;

  switch (filter) {
    case "week": {
      if (startOfPeriod && endOfPeriod) {
        startOfPeriod.setDate(
          startOfPeriod.getDate() - ((startOfPeriod.getDay() + 6) % 7) + 1
        );
        endOfPeriod.setDate(
          endOfPeriod.getDate() + ((7 - endOfPeriod.getDay()) % 7)
        );
      }
      break;
    }
    case "month": {
      if (startOfPeriod && endOfPeriod) {
        startOfPeriod.setDate(1);
        startOfPeriod.setHours(0, 0, 0, 0);
        startOfPeriod.setMinutes(0);

        endOfPeriod.setFullYear(startOfPeriod.getFullYear());
        endOfPeriod.setMonth(startOfPeriod.getMonth());
        endOfPeriod.setDate(new Date(startOfPeriod.getFullYear(), startOfPeriod.getMonth() + 1, 0).getDate());
        endOfPeriod.setHours(23, 59, 59, 999);
      }
      break;
    }
    case "year": {
      if (startOfPeriod && endOfPeriod) {
        startOfPeriod.setMonth(0);
        startOfPeriod.setDate(1);
        startOfPeriod.setHours(0, 0, 0, 0);
        endOfPeriod.setMonth(11);
        endOfPeriod.setDate(31);
        endOfPeriod.setHours(23, 59, 59, 999);
      }
      break;
    }
    default: {
      // Handle default case if needed
    }
  }

  const binMaterials = await prisma.binMaterial.findMany({
    select: {
      name: true,
    },
  });

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
    where: {
      createdAt: {
        gte: startOfPeriod,
        lte: endOfPeriod,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const hours = Array.from({ length: 18 }, (_, i) => {
    const hour = i + 6;
    return hour.toString().padStart(2, "0") + "00";
  });

  const result: DisposalsByHour[] = hours.map((hour) => ({
    hour,
    ...Object.fromEntries(binMaterials.map((material) => [material.name, 0])),
  }));

  // Count disposals for each hour and material
  totalDisposals.forEach((disposal) => {
    // Convert UTC to UTC+8
    const localTime = new Date(disposal.createdAt);
    localTime.setHours(localTime.getUTCHours() + 8);
    const capitaliseMaterial = (material: string) =>
      material.charAt(0).toUpperCase() + material.slice(1).toLowerCase();
    const hour = localTime.getHours();
    if (hour >= 6 && hour <= 23) {
      const hourIndex = hour - 6;
      const materialName = disposal.bin.binMaterial.name;
      if (result[hourIndex]) {
        result[hourIndex][materialName] =
          (result[hourIndex][materialName] as number) + 1;
      }
    }
  });
  console.log(result);
  return result;
};

export const getAllBinsWithUserAndMaterial = async (userId?: string) => {
  const bins = await prisma.bin.findMany({
    where: userId ? { userId } : undefined,
    select: {
      id: true,
      status: true,
      currentCapacity: true,
      clearCount: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { disposals: true } },
      userId: true,
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

export const listOfBinMaterialInUse = async () => {
  const binsArr = await prisma.bin.groupBy({
    by: ["binMaterialId"],
  });
  const binMaterialsArr = await prisma.binMaterial.findMany();
  const binMaterialsMappedArr = await Promise.all(
    binsArr.map(async (bin) => {
      return {
        name: binMaterialsArr.find(
          (material) => material.id === bin.binMaterialId
        )?.name,
      };
    })
  );
  return binMaterialsMappedArr;
};

export const getFaultyBins = async (
  dateFrom?: Date,
  dateTo?: Date,
  filter?: string
) => {
  const faultyBins = await prisma.bin.findMany({
    select: {
      id: true,
      user: {
        select: {
          location: true,
          lat: true,
          long: true,
        },
      },
      binMaterial: {
        select: {
          name: true,
        },
      },
    },
    where: {
      createdAt: {
        gte: dateFrom,
        lte: dateTo,
      },
      status: BinStatus.UNDER_MAINTENANCE,
    },
  });

  return faultyBins.map((bin) => ({
    ...bin,
    user: {
      ...bin.user,
      lat: bin.user.lat && bin.user.lat.toString(),
      long: bin.user.long && bin.user.long.toString(),
    },
  }));
};

export const updateBinStatus = async (id: string, status: BinStatus) => {
  try {
    await prisma.bin.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/admin");
    return {
      success: `Bin status updated successfully, Bin ID: ${id}`,
    };
  } catch (error) {
    return { error: "Unexpected error occurred, Failed to update bin" };
  }
};
