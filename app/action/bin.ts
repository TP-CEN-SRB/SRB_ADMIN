"use server";

import prisma from "@/lib/db";
import { BinSchema } from "@/schemas";
import { Bin, BinMaterial, BinStatus, Prisma } from "@prisma/client";
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

const initialState: BinFormState = {
  message: "",
};

// export const createBin = async (formData: FormData) => {
//   await prisma.bin.create({
//     data: {
//       location: formData.get("location") as string,
//       status: formData.get("status") as BinStatus,
//       material: formData.get("material") as BinMaterial,
//       currentCapacity: Number.parseInt(
//         formData.get("currentCapacity") as string
//       ),
//     },
//   });
// };

export interface BinFormState {
  message: string;
  errors?: {
    location?: string[];
    status?: string[];
    material?: string[];
    currentCapacity?: string[];
  };
}

// const singaporeTime = new Date().toLocaleString("en-SG", {
//   timeZone: "Asia/Singapore",
//   hour12: false, // 24-hour format, remove if 12-hour format is needed
// });

export const createBin = async (values: z.infer<typeof BinSchema>) => {
  const validatedFields = BinSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }
  const formData = validatedFields.data;
  try {
    await prisma.bin.create({
      data: {
        location: formData.location as string,
        status: formData.status as BinStatus,
        material: formData.material as BinMaterial,
      },
    });
    return {
      success: "Bin created successfully",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          error:
            "A bin with the same location, status, and material already exists",
        };
      }
    } else {
      return {
        error: "Unexpected Error occurred, Failed to create bin",
      };
    }
  }
};

export const updateBin = async (id: string, formData: FormData) => {
  await prisma.bin.update({
    where: {
      id: id,
    },
    data: {
      location: formData.get("location") as string,
      status: formData.get("status") as BinStatus,
      material: formData.get("material") as BinMaterial,
    },
  });
};

export const deleteBin = async (id: string) => {
  await prisma.bin.delete({
    where: {
      id: id,
    },
  });
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
  if (bin !== null) return { error: "Duplicate record found" };
  else return null;
};

export const mapResponseToDTO = <T, U>(
  responseDTO: U,
  propertyMappings?: Record<string, keyof T>
): T => {
  // Create an empty object that will hold the mapped DTO
  const mappedDTO: Partial<T> = {};

  // Loop through each property in the responseDTO
  for (const key in responseDTO) {
    // Check if propertyMappings exist and if the current key is in propertyMappings
    if (propertyMappings && key in propertyMappings) {
      // If there is a mapping for the current key, use it to set the property in the mappedDTO
      mappedDTO[propertyMappings[key] as keyof T] = responseDTO[
        key
      ] as unknown as T[keyof T];
    } else {
      // If there is no mapping for the current key, use the key as is to set the property in the mappedDTO
      mappedDTO[key as unknown as keyof T] = responseDTO[
        key
      ] as unknown as T[keyof T];
    }
  }

  // Return the mappedDTO as a type T
  return mappedDTO as T;
};
