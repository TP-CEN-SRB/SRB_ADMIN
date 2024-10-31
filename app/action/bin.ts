"use server";

import prisma from "@/lib/db";
import { BinMaterial, BinStatus } from "@prisma/client";
import { compare } from "bcryptjs";
import { revalidatePath } from "next/cache";

// export const getAllBins = async () => {
//   return await prisma.bin.findMany();
// };

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

// const initialState: BinFormState = {
//   message: "",
// };

// // export const createBin = async (formData: FormData) => {
// //   await prisma.bin.create({
// //     data: {
// //       location: formData.get("location") as string,
// //       status: formData.get("status") as BinStatus,
// //       material: formData.get("material") as BinMaterial,
// //       currentCapacity: Number.parseInt(
// //         formData.get("currentCapacity") as string
// //       ),
// //     },
// //   });
// // };

// export interface BinFormState {
//   message: string;
//   errors?: {
//     location?: string[];
//     status?: string[];
//     material?: string[];
//     currentCapacity?: string[];
//   };
// }

// export const createBin = async (
//   prevState: BinFormState,
//   formData: FormData
// ): Promise<BinFormState> => {
//   try {
//     await prisma.bin.create({
//       data: {
//         location: formData.get("location") as string,
//         status: formData.get("status") as BinStatus,
//         material: formData.get("material") as BinMaterial,
//         currentCapacity: Number.parseInt(
//           formData.get("currentCapacity") as string
//         ),
//       },
//     });

//     return {
//       message: "Bin created successfully",
//     };
//   } catch (error) {
//     return {
//       message: "Failed to create bin",
//       errors: {
//         location: ["Failed to create bin"],
//       },
//     };
//   }
// };

// export const updateBin = async (id: string, formData: FormData) => {
//   await prisma.bin.update({
//     where: {
//       id: id,
//     },
//     data: {
//       location: formData.get("location") as string,
//       status: formData.get("status") as BinStatus,
//       material: formData.get("material") as BinMaterial,
//       currentCapacity: Number.parseInt(
//         formData.get("currentCategory") as string
//       ),
//     },
//   });
// };

// export const deleteBin = async (id: string) => {
//   await prisma.bin.delete({
//     where: {
//       id: id,
//     },
//   });
// };
