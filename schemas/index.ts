import { BinMaterial, BinStatus } from "@prisma/client";
import * as z from "zod";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const BinSchema = z.object({
  location: z.string().regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
  status: z.nativeEnum(BinStatus, { message: "Invalid status" }),
  material: z.nativeEnum(BinMaterial, { message: "Invalid material" }),
  userId: z.string().min(1, "User ID is required"),
});

const DisposalSchema = z.object({
  weightInGrams: z.coerce.number().min(1, "Minimum weight must be 1"),
  material: z.nativeEnum(BinMaterial, { message: "Invalid material" }),
});

const RewardSchema = z.object({
  name: z
    .string()
    .min(2, "Name is too short")
    .regex(/^[A-Za-z\s]+$/, "Name can only contain letters"),
  pointsRequired: z.coerce
    .number()
    .int("Must be integer")
    .gte(1, "Points cannot be negative"),
  image: z
    .instanceof(File, { message: "File must be an image" })
    .refine((file: File) => file.size !== 0, "File is required")
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `File size should not exceed ${
        MAX_FILE_SIZE / (1024 * 1024)
      } MB`,
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Only .jpg, .jpeg, .png, and .webp files are accepted",
    }),
});

export { BinSchema, DisposalSchema, RewardSchema };
