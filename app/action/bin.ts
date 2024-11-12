"use server";

import prisma from "@/lib/db";
import { BinSchema } from "@/schemas";
import { Bin, BinMaterial, BinStatus, Prisma } from "@prisma/client";
import { compare } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { date, z } from "zod";

export const getAllBins = async (startDate?: Date, endDate?: Date) => {
  if (startDate !== undefined && endDate !== undefined) {
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setHours(23, 59, 59, 999);
    return await prisma.bin.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: adjustedEndDate.toISOString(),
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
  if (bin) {
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
  let yearlyData: {
    month: string;
    bin: number;
    binMetal: number;
    binPlastic: number;
  }[] = [];
  let months: string[] = [
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
    let startDate = new Date(`2024-${String(i).padStart(2, "0")}-01`); // Start of the month
    let endDate;

    endDate = new Date(`2024-${String(i).padStart(2, "0")}-01`);
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
  let pieChartData: {
    binType: BinMaterial;
    binCount: number;
    fill: String;
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

export const getLatestBins = async () => {
  const binDtoArray: {
    location: string;
    status: BinStatus;
    material: BinMaterial;
    createdAt: string;
  }[] = [];
  const result = await prisma.bin.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 5,
    select: {
      location: true,
      status: true,
      material: true,
      createdAt: true,
    },
  });
  result.forEach((bin) => {
    binDtoArray.push({
      location: bin.location,
      status: bin.status,
      material: bin.material,
      createdAt: bin.createdAt.toISOString(),
    });
  });
  return binDtoArray;
};

// export const getPercentageDiff = async () => {
//   var percentageDiff = 0.0;
//   const today = new Date();

//   // Calculate last Monday by going back to the start of this week and then 7 days back
//   const lastMonday = new Date(today);
//   lastMonday.setDate(today.getDate() - today.getDay() - 6); // Last Monday

//   // Set lastMonday to the start of that day (midnight)
//   lastMonday.setHours(0, 0, 0, 0);

//   // Calculate lastSunday by adding 6 days to lastMonday
//   const lastSunday = new Date(lastMonday);
//   lastSunday.setDate(lastMonday.getDate() + 6);

//   // Set lastSunday to the end of that day (11:59 PM)
//   lastSunday.setHours(23, 59, 59, 999);

//   // Query for bins deployed in the range of last Monday to last Sunday
//   const binsDeployedLastWeek = await prisma.bin.findMany({
//     where: {
//       createdAt: {
//         gte: lastMonday,
//         lt: new Date(lastSunday.setHours(23, 59, 59, 999)), // End of last Sunday
//       },
//     },
//   });

//   const binsDeployedThisWeek = await prisma.bin.findMany({
//     where: {
//       createdAt: {
//         gte: new Date(lastSunday.setHours(0, 0, 0, 0)), // Start of this Monday
//         lte: today,
//       },
//     },
//   });

//   percentageDiff =
//     binsDeployedLastWeek.length > 0
//       ? ((binsDeployedThisWeek.length - binsDeployedLastWeek.length) /
//           binsDeployedLastWeek.length) *
//         100
//       : 0;

//   return percentageDiff;
// };

export const getBinDisposalsByTime = async () => {
  var hourlyDisposalData: {
    hour: string;
    totalDisposals: number;
    metalDisposals: number;
    plasticDisposals: number;
  }[] = [];
  var metalDisposals = [];
  var plasticDisposals = [];
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
          material: true,
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
  for (var i = 0; i < totalDisposals.length; i++) {
    if (totalDisposals[i].bin.material == "METAL") {
      metalDisposals.push(totalDisposals[i]);
    } else if (totalDisposals[i].bin.material == "PLASTIC") {
      plasticDisposals.push(totalDisposals[i]);
    }
  }

  for (var i = 0; i < hours.length - 1; i++) {
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

export const getAllBinsWithUser = async () => {
  return await prisma.bin.findMany({
    include: {
      User: {
        select: {
          name: true,
        },
      },
    },
  });
};
